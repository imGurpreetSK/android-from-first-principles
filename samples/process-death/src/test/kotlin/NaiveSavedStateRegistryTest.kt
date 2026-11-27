import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class NaiveSavedStateRegistryTest {
    private val registry = NaiveSavedStateRegistry()

    // region save
    @Test
    fun naiveRegistry_savesStateOfEachProvider_underItsKey() {
        registry.performRestore(null)
        Counter(registry, "A").count = 1
        Counter(registry, "B").count = 2
        assertEquals(mapOf("A" to mapOf("count" to 1), "B" to mapOf("count" to 2)), registry.performSave())
    }
    // endregion

    @Test
    fun naiveRegistry_givesRestoredState_onlyOneTime() {
        registry.performRestore(mapOf("A" to mapOf("count" to 1)))
        assertEquals(mapOf("count" to 1), registry.consumeRestoredStateForKey("A"))
        assertNull(registry.consumeRestoredStateForKey("A"))
    }

    @Test
    fun naiveRegistry_rejectsSecondProvider_forSameKey() {
        registry.registerSavedStateProvider("A") { emptyMap() }
        assertThrows<IllegalArgumentException> { registry.registerSavedStateProvider("A") { emptyMap() } }
    }

    @Test
    fun counter_startsFromRestoredCount() {
        registry.performRestore(mapOf("A" to mapOf("count" to 1)))
        assertEquals(1, Counter(registry, "A").count)
    }

    @Test
    fun counter_startsFromZero_whenRegistryHasNoStateForItsKey() {
        registry.performRestore(null)
        val counter = Counter(registry, "A")
        assertNull(counter.restored)
        assertEquals(0, counter.count)
    }
}
