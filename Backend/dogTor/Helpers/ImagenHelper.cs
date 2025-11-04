using System;
using System.IO;

namespace dogTor.Helpers
{
    public static class ImagenHelper
    {
        public static string ConvertirArchivoABase64(string rutaArchivo)
        {
            if (!File.Exists(rutaArchivo))
                throw new FileNotFoundException("No se encontró el archivo.", rutaArchivo);

            byte[] bytes = File.ReadAllBytes(rutaArchivo);
            string extension = Path.GetExtension(rutaArchivo).ToLower().Replace(".", "");
            string base64 = Convert.ToBase64String(bytes);

            return $"data:image/{extension};base64,{base64}";
        }
    }
}
