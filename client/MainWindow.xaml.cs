using client.Models;
using client.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Threading;

namespace client
{
    public partial class MainWindow : Window
    {
        private readonly VideoService _videoService = new VideoService();
        private readonly AuthService _authService = new AuthService();
        private string _token;
        private List<Video> _videos;
        private readonly DispatcherTimer _timer;

        public MainWindow()
        {
            InitializeComponent();

            _timer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(1) };
            _timer.Tick += UpdateProgress;

            VideoPlayer.MediaOpened += VideoPlayer_MediaOpened;
            VideoPlayer.MediaEnded += VideoPlayer_MediaEnded;
            VideoPlayer.Volume = 0.5;
        }

        private async void Window_Loaded(object sender, RoutedEventArgs e)
        {
            FadeInWindow(0.3);
            _token = TokenManager.LoadToken();

            if (!string.IsNullOrEmpty(_token))
            {
                bool isProfileLoaded = await LoadUserProfile();
                if (isProfileLoaded)
                {
                    ShowLoggedInUI();
                }
                else
                {
                    TokenManager.ClearToken();
                    _token = null;
                    ShowGuestUI();
                }
            }
            else
            {
                ShowGuestUI();
            }

            await LoadVideos();
        }

        private async Task<bool> LoadUserProfile()
        {
            try
            {
                var profile = await _authService.GetProfileAsync(_token);
                if (profile != null)
                {
                    UsernameText.Text = $"Имя: {profile.Username}";
                    PermsText.Text = $"Права: {profile.Perms}";
                    BanText.Text = (profile.Ban != null && profile.Ban.Count > 0)
                                    ? "Бан: " + string.Join(", ", profile.Ban)
                                    : "Бан: отсутствует";
                    return true;
                }
            }
            catch(Exception ex) {
                MessageBox.Show("Произошла ошибка:" + ex.Message.ToString());
            }
            return false;
        }

        private void ShowGuestUI()
        {
            ProfilePanel.Visibility = Visibility.Collapsed;
            OpenUploadWindowButton.Visibility = Visibility.Collapsed;
            LogoutButton.Visibility = Visibility.Collapsed;
            LoginButton.Visibility = Visibility.Visible;
        }

        private void ShowLoggedInUI()
        {
            ProfilePanel.Visibility = Visibility.Visible;
            OpenUploadWindowButton.Visibility = Visibility.Visible;
            LogoutButton.Visibility = Visibility.Visible;
            LoginButton.Visibility = Visibility.Collapsed;
        }

        private async void LoginButton_Click(object sender, RoutedEventArgs e)
        {
            var loginWindow = new Views.LoginWindow();
            loginWindow.ShowDialog();

            if (loginWindow.UserToken != null)
            {
                _token = loginWindow.UserToken;
                TokenManager.SaveToken(_token);

                bool isProfileLoaded = await LoadUserProfile();
                if (isProfileLoaded)
                {
                    ShowLoggedInUI();
                }
                else
                {
                    TokenManager.ClearToken();
                    _token = null;
                    ShowGuestUI();
                }
            }
        }

        private void LogoutButton_Click(object sender, RoutedEventArgs e)
        {
            TokenManager.ClearToken();
            _token = null;
            ShowGuestUI();
        }

        private void OpenUploadWindow_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrEmpty(_token))
            {
                MessageBox.Show("Нужно авторизоваться, чтобы загрузить видео.");
                return;
            }

            var uploadWindow = new Views.UploadVideoWindow(_token);
            uploadWindow.ShowDialog();

            _ = LoadVideos();
        }

        private async Task LoadVideos()
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
            StopPlayback();
        }

        private void UpdateProgress(object sender, EventArgs e)
        {
            if (VideoPlayer.NaturalDuration.HasTimeSpan)
            {
                SeekBar.Maximum = VideoPlayer.NaturalDuration.TimeSpan.TotalSeconds;
                SeekBar.Value = VideoPlayer.Position.TotalSeconds;
                CurrentTime.Text = VideoPlayer.Position.ToString(@"m\:ss");
                TotalTime.Text = VideoPlayer.NaturalDuration.TimeSpan.ToString(@"m\:ss");
            }
        }

        private void SeekBar_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            if (VideoPlayer.NaturalDuration.HasTimeSpan)
            {
                try
                {
                    VideoPlayer.Position = TimeSpan.FromSeconds(SeekBar.Value);
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Ошибка при изменении позиции: {ex.Message}");
                }
            }
        }

        private void VolumeSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            try
            {
                VideoPlayer.Volume = VolumeSlider.Value;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при изменении громкости: {ex.Message}");
            }
        }

        private void VideoPlayer_MediaOpened(object sender, RoutedEventArgs e)
        {
            if (VideoPlayer.NaturalDuration.HasTimeSpan)
            {
                SeekBar.Maximum = VideoPlayer.NaturalDuration.TimeSpan.TotalSeconds;
                TotalTime.Text = VideoPlayer.NaturalDuration.TimeSpan.ToString(@"m\:ss");
            }
        }

        private void VideoPlayer_MediaEnded(object sender, RoutedEventArgs e)
        {
            StopPlayback();
        }

        private void StopPlayback()
        {
            VideoPlayer.Stop();
            _timer.Stop();
            SeekBar.Value = 0;
            CurrentTime.Text = "0:00";
        }
        private void MinimizeButton_Click(object sender, RoutedEventArgs e)
        {
            FadeOutScaleWindow(0.2, () => this.WindowState = WindowState.Minimized);
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            FadeOutWindow(0.2, () => this.Close());
        }

        private void MaximizeRestoreButton_Click(object sender, RoutedEventArgs e)
        {
            if (this.WindowState == WindowState.Normal)
            {
                this.WindowState = WindowState.Maximized;
            }
            else
            {
                this.WindowState = WindowState.Normal;
            }
        }

        private void FadeInWindow(double durationSeconds)
        {
            var anim = new DoubleAnimation
            {
                From = 0,
                To = 1,
                Duration = TimeSpan.FromSeconds(durationSeconds)
            };
            RootGrid.BeginAnimation(UIElement.OpacityProperty, anim);
        }

        private void FadeOutWindow(double durationSeconds, Action onCompleted)
        {
            var anim = new DoubleAnimation
            {
                From = RootGrid.Opacity,
                To = 0,
                Duration = TimeSpan.FromSeconds(durationSeconds)
            };

            anim.Completed += (s, e) => onCompleted?.Invoke();
            RootGrid.BeginAnimation(UIElement.OpacityProperty, anim);
        }

        private void DragArea_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ChangedButton == MouseButton.Left)
            {
                DragMove();
            }
        }
        private void FadeOutScaleWindow(double durationSeconds, Action onCompleted)
        {
            var storyboard = new Storyboard();

            var opacityAnim = new DoubleAnimation
            {
                From = RootGrid.Opacity,
                To = 0,
                Duration = TimeSpan.FromSeconds(durationSeconds)
            };
            Storyboard.SetTarget(opacityAnim, RootGrid);
            Storyboard.SetTargetProperty(opacityAnim, new PropertyPath("Opacity"));

            var scaleAnimX = new DoubleAnimation
            {
                From = 1,
                To = 0.8,
                Duration = TimeSpan.FromSeconds(durationSeconds)
            };
            Storyboard.SetTarget(scaleAnimX, RootGrid.RenderTransform);
            Storyboard.SetTargetProperty(scaleAnimX, new PropertyPath("ScaleX"));

            var scaleAnimY = new DoubleAnimation
            {
                From = 1,
                To = 0.8,
                Duration = TimeSpan.FromSeconds(durationSeconds)
            };
            Storyboard.SetTarget(scaleAnimY, RootGrid.RenderTransform);
            Storyboard.SetTargetProperty(scaleAnimY, new PropertyPath("ScaleY"));

            storyboard.Children.Add(opacityAnim);
            storyboard.Children.Add(scaleAnimX);
            storyboard.Children.Add(scaleAnimY);

            storyboard.Completed += (s, e) => onCompleted?.Invoke();
            storyboard.Begin();
        }
        protected override void OnStateChanged(EventArgs e)
        {
            base.OnStateChanged(e);
            if (WindowState == WindowState.Normal || WindowState == WindowState.Maximized)
            {
                RootGrid.Opacity = 1;
                //((ScaleTransform)RootGrid.RenderTransform).ScaleX = 1;
                //((ScaleTransform)RootGrid.RenderTransform).ScaleY = 1;
            }
        }
    }
}
