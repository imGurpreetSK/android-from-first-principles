import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Test

class NaiveZygoteTest {
    // region preload
    @Test
    fun preload_loadsEachClassOneTime_forManyForks() {
        val zygote = NaiveZygote(placeholderClasses, seed = 42)
        zygote.preload()
        val apps = List(5) { zygote.fork() }
        assertEquals(placeholderClasses.size, zygote.classLoads)
        for (app in apps) assertEquals(placeholderClasses, app.classes.keys.toList())
    }
    // endregion

    @Test
    fun fork_givesEachChildItsOwnCopy() {
        val zygote = NaiveZygote(placeholderClasses, seed = 42)
        zygote.preload()
        val app1 = zygote.fork()
        val app2 = zygote.fork()
        app1.classes["AppClass"] = "code of AppClass"
        assertFalse("AppClass" in app2.classes)
        assertFalse("AppClass" in zygote.fork().classes)
    }

    // region flaw
    @Test
    fun naiveFork_givesSameRandomNumber_toEveryChild() {
        val zygote = NaiveZygote(placeholderClasses, seed = 42)
        zygote.preload()
        val app1 = zygote.fork()
        val app2 = zygote.fork()
        assertEquals(app1.random.nextInt(), app2.random.nextInt())
    }
    // endregion
}

// The zygote does not run the code, so placeholder names are enough.
private val placeholderClasses = listOf("ClassA", "ClassB", "ClassC")
