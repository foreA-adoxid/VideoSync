using client.Models;
using Newtonsoft.Json;
using RestSharp;
using System.IO;

namespace client.Services
{
    public class VideoService
    {
        private const string ApiUrl = "http://localhost:4000";

        public async Task<List<Video>> GetVideosAsync(string token)
        {
            var client = new RestClient(ApiUrl);
            var request = new RestRequest("/videos")
            {
                Method = Method.Get
            };
            request.AddHeader("Authorization", $"Bearer {token}");

            var response = await client.ExecuteAsync(request);
            if (response.IsSuccessful)
            {
                return JsonConvert.DeserializeObject<List<Video>>(response.Content);
            }

            throw new System.Exception("Failed to fetch videos");
        }

        public async Task UploadVideoAsync(string token, string filePath, string title, string description)
        {
            var client = new RestClient($"{ApiUrl}/videos/upload");
            var request = new RestRequest
            {
                Method = Method.Post
            };

            var mimeType = GetMimeType(filePath);

            request.AddHeader("Authorization", $"Bearer {token}");
            request.AddFile("file", filePath, mimeType); 
            request.AddParameter("title", title);
            request.AddParameter("description", description);

            var response = await client.ExecuteAsync(request);
            if (!response.IsSuccessful)
            {
                throw new System.Exception($"Ошибка загрузки: {response.StatusDescription}");
            }
        }

        private string GetMimeType(string filePath)
        {
            var extension = Path.GetExtension(filePath).ToLower();
            return extension switch
            {
                ".mp4" => "video/mp4",
                ".mkv" => "video/x-matroska",
                ".avi" => "video/x-msvideo",
                ".webm" => "video/webm",
                _ => "application/octet-stream",
            };
        }
    }
}
