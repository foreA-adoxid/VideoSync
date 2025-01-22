using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;
using client.Models;
using client.Services;

namespace client
{
    public partial class MainWindow : Window
    {
        private readonly VideoService _videoService = new VideoService();
        private readonly AuthService _authService = new AuthService();
        private string _token;
        private List<Video> _videos;

        private DispatcherTimer _timer; 

        public MainWindow()
        {
            InitializeComponent();

            _timer = new DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(1)
            };
            _timer.Tick += Timer_Tick;

            VideoPlayer.MediaOpened += VideoPlayer_MediaOpened;
            VideoPlayer.Volume = 0.5;
        }

        private async void Window_Loaded(object sender, RoutedEventArgs e)
        {
            try
            {
                _token = TokenManager.LoadToken();

                if (string.IsNullOrEmpty(_token))
                {
                    var loginWindow = new Views.LoginWindow();
                    loginWindow.ShowDialog();

                    if (loginWindow.UserToken == null)
                    {
                        MessageBox.Show("Авторизация обязательна для работы с клиентом.");
                        Close();
                        return;
                    }

                    _token = loginWindow.UserToken;

                    TokenManager.SaveToken(_token);
                }

                _videos = await _videoService.GetVideosAsync(_token);
                VideoList.ItemsSource = _videos;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка загрузки видео: {ex.Message}");
            }
        }

        private void VideoList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (VideoList.SelectedItem is Video selectedVideo)
            {
                VideoPlayer.Source = new Uri(selectedVideo.FilePath);
                _timer.Start();
            }
        }

        private void PlayButton_Click(object sender, RoutedEventArgs e)
        {
            if (VideoPlayer.Source != null)
            {
                VideoPlayer.Play();
                _timer.Start();
            }
            else
            {
                MessageBox.Show("Выберите видео для воспроизведения.");
            }
        }

        private void PauseButton_Click(object sender, RoutedEventArgs e)
        {
            VideoPlayer.Pause();
            _timer.Stop();
        }

        private void StopButton_Click(object sender, RoutedEventArgs e)
        {
            VideoPlayer.Stop();
            _timer.Stop();
            SeekBar.Value = 0;
            CurrentTime.Text = "0:00";
        }

        private void LogoutButton_Click(object sender, RoutedEventArgs e)
        {
            TokenManager.ClearToken();

            MessageBox.Show("Вы вышли из аккаунта.", "Logout", MessageBoxButton.OK, MessageBoxImage.Information);

            var loginWindow = new Views.LoginWindow();
            loginWindow.ShowDialog();

            if (loginWindow.UserToken == null)
            {
                Close();
                return;
            }

            _token = loginWindow.UserToken;
            TokenManager.SaveToken(_token);

            LoadVideos();
        }

        private void OpenUploadWindow_Click(object sender, RoutedEventArgs e)
        {
            var uploadWindow = new Views.UploadVideoWindow(_token);
            uploadWindow.ShowDialog();

            LoadVideos();
        }

        private async void LoadVideos()
        {
            try
            {
                _videos = await _videoService.GetVideosAsync(_token);
                VideoList.ItemsSource = _videos;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка загрузки видео: {ex.Message}");
            }
        }

        private void Timer_Tick(object sender, EventArgs e)
        {
            if (VideoPlayer.NaturalDuration.HasTimeSpan)
            {
                SeekBar.Value = VideoPlayer.Position.TotalSeconds;
                CurrentTime.Text = VideoPlayer.Position.ToString(@"m\:ss");
            }
        }

        private void SeekBar_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            if (VideoPlayer.NaturalDuration.HasTimeSpan && SeekBar.IsMouseCaptureWithin)
            {
                VideoPlayer.Position = TimeSpan.FromSeconds(e.NewValue);
            }
        }

        private void VolumeSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            VideoPlayer.Volume = e.NewValue;
        }

        private void VideoPlayer_MediaOpened(object sender, RoutedEventArgs e)
        {
            if (VideoPlayer.NaturalDuration.HasTimeSpan)
            {
                SeekBar.Maximum = VideoPlayer.NaturalDuration.TimeSpan.TotalSeconds;
                TotalTime.Text = VideoPlayer.NaturalDuration.TimeSpan.ToString(@"m\:ss");
            }
        }
    }
}
