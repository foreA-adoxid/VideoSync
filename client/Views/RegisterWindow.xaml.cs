using System.Windows;
using client.Services;

namespace client.Views
{
    public partial class RegisterWindow : Window
    {
        private readonly AuthService _authService = new AuthService();

        public RegisterWindow()
        {
            InitializeComponent();
        }

        private async void RegisterButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var username = UsernameBox.Text;
                var password = PasswordBox.Password;
                var confirmPassword = ConfirmPasswordBox.Password;

                if (password != confirmPassword)
                {
                    MessageBox.Show("Пароли не совпадают!", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                await _authService.RegisterAsync(username, password);
                MessageBox.Show("Регистрация успешна!", "Успех", MessageBoxButton.OK, MessageBoxImage.Information);

                Close(); 
            }
            catch (System.Exception ex)
            {
                MessageBox.Show($"Ошибка регистрации: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }
}
