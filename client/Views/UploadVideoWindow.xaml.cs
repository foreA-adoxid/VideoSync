using System.Windows;
using Microsoft.Win32;
using client.Services;

namespace client.Views
{
    public partial class UploadVideoWindow : Window
    {
        private readonly VideoService _videoService = new VideoService();
        private string _token; 
        private string _filePath;

        public UploadVideoWindow(string token)
        {
            InitializeComponent();
            _token = token;
        }

        private void SelectFileButton_Click(object sender, RoutedEventArgs e)
        {
            var openFileDialog = new OpenFileDialog
            {
                Filter = "Видео файлы|*.mp4;*.mkv;*.avi;*.webm"
            };

            if (openFileDialog.ShowDialog() == true)
            {
                _filePath = openFileDialog.FileName;
                FilePathText.Text = _filePath;
            }
        }

        private async void UploadButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (string.IsNullOrEmpty(_filePath))
                {
                    MessageBox.Show("Выберите файл для загрузки!", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                var title = TitleBox.Text;
                var description = DescriptionBox.Text;

                if (string.IsNullOrEmpty(title))
                {
                    MessageBox.Show("Введите название видео!", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                await _videoService.UploadVideoAsync(_token, _filePath, title, description);

                MessageBox.Show("Видео успешно загружено!", "Успех", MessageBoxButton.OK, MessageBoxImage.Information);
                Close();
            }
            catch (System.Exception ex)
            {
                MessageBox.Show($"Ошибка загрузки видео: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }

    }
}
