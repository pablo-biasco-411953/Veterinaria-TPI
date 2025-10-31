using System;
using System.IO;

namespace dogTor.Helpers
{
    public static class ImagenHelper
    {
        /// <summary>
        /// Convierte un archivo a Base64 listo para <img src="...">
        /// </summary>
        /// <param name="rutaArchivo">Ruta del archivo en disco</param>
        /// <returns>Base64 con prefijo data:image/png;base64,</returns>
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
