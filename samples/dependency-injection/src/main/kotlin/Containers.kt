// region graph
class UserRepository

// The input of one login flow.
class LoginUserData {
    var username = ""
}

class LoginViewModel(val userRepository: UserRepository)
// endregion

// region app-container
// The container of the whole app. The Application holds one AppContainer.
class AppContainer {
    // Scoped: `lazy` keeps the first UserRepository, so each caller of this container gets the same object.
    val userRepository by lazy { UserRepository() }

    // Unscoped: each call creates a new LoginViewModel.
    fun loginViewModel() = LoginViewModel(userRepository)
}
// endregion

// region screen-container
// A child container for one login screen. It gets the objects of the whole app from its parent.
class ScreenContainer(private val appContainer: AppContainer) {
    // Scoped to this container: each ScreenContainer creates its own LoginUserData.
    val loginData by lazy { LoginUserData() }

    fun loginViewModel() = appContainer.loginViewModel()
}
// endregion

// region activity
// A stand-in for an Activity. `appContainer` stands in for the container in the Application, which lives longer than each Activity.
class FakeActivity(private val appContainer: AppContainer) {
    private lateinit var screenContainer: ScreenContainer
    lateinit var loginData: LoginUserData
        private set
    lateinit var loginViewModel: LoginViewModel
        private set

    fun onCreate() {
        // The flaw: this Activity instance holds the container. A new Activity instance creates a new container, with new scoped objects.
        screenContainer = ScreenContainer(appContainer)
        loginData = screenContainer.loginData
        loginViewModel = screenContainer.loginViewModel()
    }

    // A configuration change: the system destroys this instance and creates a new instance.
    fun recreate(): FakeActivity = FakeActivity(appContainer).also { it.onCreate() }
}
// endregion
