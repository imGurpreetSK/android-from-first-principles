import org.junit.jupiter.api.Assertions.assertNotSame
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Test

class ContainersTest {
    private val appContainer = AppContainer()

    // region containers
    @Test
    fun appContainer_returnsSameUserRepository_toEachCaller() {
        assertSame(appContainer.userRepository, appContainer.userRepository)
    }

    @Test
    fun appContainer_createsNewLoginViewModel_withSameUserRepository() {
        val first = appContainer.loginViewModel()
        val second = appContainer.loginViewModel()
        assertNotSame(first, second)
        assertSame(first.userRepository, second.userRepository)
    }

    @Test
    fun activity_getsUserRepositoryOfAppContainer() {
        val activity = FakeActivity(appContainer)
        activity.onCreate()
        assertSame(appContainer.userRepository, activity.loginViewModel.userRepository)
    }
    // endregion
}
