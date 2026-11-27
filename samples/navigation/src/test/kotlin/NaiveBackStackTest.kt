import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test

class NaiveBackStackTest {
    private val stack = NaiveBackStack()

    @Test
    fun back_showsRouteBelowTop() {
        stack.navigate("list")
        stack.navigate("detail")
        assertEquals("detail", stack.top)
        stack.back()
        assertEquals("list", stack.top)
    }

    @Test
    fun back_keepsStateOfRouteBelow() {
        stack.navigate("list")
        stack.topState = 3
        stack.navigate("detail")
        stack.topState = 7
        stack.back()
        assertEquals(3, stack.topState)
    }

    @Test
    fun navigateAgain_afterBack_startsWithNoState() {
        stack.navigate("list")
        stack.navigate("detail")
        stack.topState = 7
        stack.back()
        stack.navigate("detail")
        assertNull(stack.topState)
    }
}
