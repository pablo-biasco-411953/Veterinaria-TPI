using dogTor.Models;
using dogTor.Repositories.Implementations;
using dogTor.Repositories.Interfaces;
using dogTor.Repository;
using dogTor.Services.Implementations; 
using dogTor.Services.Interfaces; 
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Veterinaria6.Repository;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<veterinariaContext>( 
    options => options.UseSqlServer(builder.Configuration.GetConnectionString("Conexion")));


// Repositorios
builder.Services.AddScoped<IAtencionService, AtencionService>();
builder.Services.AddScoped<IMascotaRepository, MascotaRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAtencionRepository, AtencionRepository>();
builder.Services.AddScoped<IServicioReservadoRepository, ServicioReservadoRepository>();

builder.Services.AddScoped<IClienteService, ClienteService>();
builder.Services.AddScoped<IClienteRepository, ClienteRepository>();
builder.Services.AddScoped<IServicioMasFacturadoRepository, ServicioMasFacturadoRepository>();
builder.Services.AddScoped<IVeterinarioConMasTurnos, VeterinariosConMasTurnosRepository>();


// Servicios
builder.Services.AddScoped<IMascotaService, MascotaService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<EmailService>();

// Configuramos JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSettings = builder.Configuration.GetSection("Jwt");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]))
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("CORS",
    policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.UseCors("CORS");

app.MapControllers();

app.Run();