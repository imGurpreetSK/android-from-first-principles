// region state
// A stand-in for android.os.Bundle. On Android, the SavedState type of AndroidX is a Bundle.
typealias SavedState = Map<String, Any?>

// A stand-in for SavedStateRegistry.SavedStateProvider.
fun interface SavedStateProvider {
    fun saveState(): SavedState
}
// endregion

// region registry
// A stand-in for SavedStateRegistry. Each component saves its state under its own key.
class NaiveSavedStateRegistry {
    private val keyToProviders = mutableMapOf<String, SavedStateProvider>()
    private var restoredState: MutableMap<String, SavedState>? = null

    fun registerSavedStateProvider(key: String, provider: SavedStateProvider) {
        require(key !in keyToProviders) { "A provider with the key $key is already registered" }
        keyToProviders[key] = provider
    }

    fun performRestore(savedState: Map<String, SavedState>?) {
        restoredState = savedState?.toMutableMap()
    }

    fun consumeRestoredStateForKey(key: String): SavedState? = restoredState?.remove(key)

    // The flaw: the save writes only the state of the providers that the registry holds now.
    // It drops each restored state that no component consumed.
    fun performSave(): Map<String, SavedState> = keyToProviders.mapValues { (_, provider) -> provider.saveState() }
}
// endregion

// region counter
// A component that keeps one number in the registry under its own key.
class Counter(registry: NaiveSavedStateRegistry, key: String) {
    // Null if the registry has no saved state for the key.
    val restored: SavedState? = registry.consumeRestoredStateForKey(key)
    var count = restored?.get("count") as Int? ?: 0

    init {
        registry.registerSavedStateProvider(key) { mapOf("count" to count) }
    }
}
// endregion
