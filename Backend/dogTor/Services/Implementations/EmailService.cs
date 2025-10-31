using System.Net.Mail;
using System.Net;

public class EmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var smtpConfig = _configuration.GetSection("ConfiguracionSMTP");

        using var client = new SmtpClient(smtpConfig["Host"], int.Parse(smtpConfig["Port"]))
        {
            EnableSsl = bool.Parse(smtpConfig["UseSSL"]),
            Credentials = new NetworkCredential(smtpConfig["UserName"], smtpConfig["Password"])
        };

        var mail = new MailMessage()
        {
            From = new MailAddress(smtpConfig["From"], smtpConfig["DisplayName"]),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };

        mail.To.Add(toEmail);

        try
        {
            await client.SendMailAsync(mail);
        }
        catch (Exception ex)
        {
            // Podés loguear ex.Message o re-lanzar la excepción
            throw new InvalidOperationException($"Error enviando email: {ex.Message}", ex);
        }
    }
}
