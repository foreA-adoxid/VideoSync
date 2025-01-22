using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace client.Models
{
    public class User
    {
        public int Id { get; set; } 
        public string Username { get; set; }
        public string Password { get; set; } 

        public List<string> Sessions { get; set; } 
        public List<string> Ips { get; set; }

        public string Perms { get; set; }

        public List<string> Ban { get; set; }

        public long CreatedAt { get; set; } 
        public long? UpdatedAt { get; set; }
        public string Token { get; set; } 

    }
}
