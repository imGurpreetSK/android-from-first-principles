// region viewmodel
// A stand-in for ViewModel. The count shows if something cleared the ViewModel.
open class ViewModel {
    var onClearedCalls = 0
        private set

    fun onCleared() {
        onClearedCalls++
    }
}

class CounterViewModel : ViewModel() {
    var count = 0
}
// endregion

// region problem
// The ViewModel is a field, so it lives only as long as this Activity object.
class FieldActivity : Activity() {
    val viewModel = CounterViewModel()

    override fun onCreate() {
        viewModel.count++
    }
}
// endregion

// region store
// One map for the whole process, so that a ViewModel outlives the Activity object that created it.
object NaiveViewModelStore {
    val viewModels = mutableMapOf<String, ViewModel>()

    // The flaw: the key is the class of the Activity, not its token. No code removes an entry, because the store cannot tell a relaunch from a finish.
    fun getOrCreate(activity: Activity, create: () -> ViewModel): ViewModel =
        viewModels.getOrPut(activity.javaClass.name, create)
}
// endregion

// region store-activity
class StoreActivity : Activity() {
    lateinit var viewModel: CounterViewModel

    override fun onCreate() {
        viewModel = NaiveViewModelStore.getOrCreate(this) { CounterViewModel() } as CounterViewModel
        viewModel.count++
    }
}
// endregion
