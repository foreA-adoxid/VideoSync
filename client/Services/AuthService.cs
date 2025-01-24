using client.Models;
using Newtonsoft.Json;
using RestSharp;
using System.Threading.Tasks;

namespace client.Services
{
    public class AuthService
    {
        private const string ApiUrl = "http://localhost:4000";

        public async Task<User> LoginAsync(string username, string password)
        {
            var client = new RestClient(ApiUrl);
            var request = new RestRequest("/auth/login")
            {
                Method = Method.Post
            };
            request.AddJsonBody(new { username, password });

            var response = await client.ExecuteAsync(request);
            if (response.IsSuccessful)
            {
                return JsonConvert.DeserializeObject<User>(response.Content);
            }

            throw new System.Exception("Login failed");
        }

        public async Task<User> RegisterAsync(string username, string password)
        {
            var client = new RestClient(ApiUrl);
            var request = new RestRequest("/auth/register")
            {
                Method = Method.Post
            };
            request.AddJsonBody(new { username, password });

            var response = await client.ExecuteAsync(request);
            if (response.IsSuccessful)
            {
                return JsonConvert.DeserializeObject<User>(response.Content);
            }

            throw new System.Exception("Registration failed");
        }
        public async Task<User> GetProfileAsync(string token)
        {
            var client = new RestClient(ApiUrl);
            var request = new RestRequest("/users/profile/me", Method.Get);

            request.AddHeader("Authorization", "Bearer " + token);

            var response = await client.ExecuteAsync(request);
            if (response.IsSuccessful && !string.IsNullOrEmpty(response.Content))
            {
                return JsonConvert.DeserializeObject<User>(response.Content);
            }

            throw new System.Exception("Failed to retrieve profile");
        }
    }
}
