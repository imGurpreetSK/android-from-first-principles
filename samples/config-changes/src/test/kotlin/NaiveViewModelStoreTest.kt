import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotSame
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class NaiveViewModelStoreTest {
    // region setup
    private val day = Configuration(orientation = "portrait", uiMode = "notnight")
    private val night = day.copy(uiMode = "night")

    // Each test is a new process. A new process starts with an empty store.
    @BeforeEach
    fun startProcess() = NaiveViewModelStore.viewModels.clear()
    // endregion

    @Test
    fun relaunch_replacesObject_onSameToken_withNewConfig() {
        val thread = FakeActivityThread(day) { FieldActivity() }
        val old = thread.launch("a")
        val new = thread.relaunch("a", night)
        assertTrue(old.isDestroyed)
        assertNotSame(old, new)
        assertEquals("a", new.token)
        assertEquals(night, new.config)
    }

    // region problem
    @Test
    fun viewModelInField_isNew_afterRelaunch() {
        val thread = FakeActivityThread(day) { FieldActivity() }
        val first = thread.launch("a")
        val second = thread.relaunch("a", night)
        assertNotSame(first.viewModel, second.viewModel)
        assertEquals(1, second.viewModel.count)
    }
    // endregion

    // region relaunch
    @Test
    fun naiveStore_keepsViewModel_acrossRelaunch() {
        val thread = FakeActivityThread(day) { StoreActivity() }
        val first = thread.launch("a")
        val second = thread.relaunch("a", night)
        assertSame(first.viewModel, second.viewModel)
        assertEquals(2, second.viewModel.count)
    }
    // endregion
}
