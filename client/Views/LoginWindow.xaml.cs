using System.Windows;
using client.Services;
using Newtonsoft.Json.Linq;

namespace client.Views
{
    public partial class LoginWindow : Window
    {
        private readonly AuthService _authService = new AuthService();
        public string UserToken { get; private set; }

        public LoginWindow()
        {
            InitializeComponent();
        }

        private async void LoginButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var username = UsernameBox.Text;
                var password = PasswordBox.Password;

                var user = await _authService.LoginAsync(username, password);
                UserToken = user.Token;

                TokenManager.SaveToken(UserToken);

                MessageBox.Show("Авторизация успешна!");
                Close();
            }
            catch (System.Exception ex)
            {
                MessageBox.Show($"Ошибка авторизации: {ex.Message}");
            }
        }
        private void RegisterButton_Click(object sender, RoutedEventArgs e)
        {
            var registerWindow = new Views.RegisterWindow();
            registerWindow.ShowDialog();
            Close();
        }
    }
}
