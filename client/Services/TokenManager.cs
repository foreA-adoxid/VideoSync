using System.IO;
using Newtonsoft.Json;

namespace client.Services
{
    public static class TokenManager
    {
        private const string TokenFilePath = "userToken.json";

        public static void SaveToken(string token)
        {
            var tokenData = new { Token = token };
            var json = JsonConvert.SerializeObject(tokenData, Formatting.Indented);
            File.WriteAllText(TokenFilePath, json);
        }

        public static string LoadToken()
        {
            if (File.Exists(TokenFilePath))
            {
                var json = File.ReadAllText(TokenFilePath);
                var tokenData = JsonConvert.DeserializeObject<dynamic>(json);
                return tokenData?.Token;
            }
            return null;
        }

        public static void ClearToken()
        {
            if (File.Exists(TokenFilePath))
            {
                File.Delete(TokenFilePath);
            }
        }
    }
}
