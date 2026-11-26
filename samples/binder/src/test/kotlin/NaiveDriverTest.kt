import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertInstanceOf
import org.junit.jupiter.api.Assertions.assertNotSame
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Test

class NaiveDriverTest {
    private val driver = NaiveDriver()
    private val app = Process(driver)
    private val server = Process(driver)
    private val activityManager = ActivityManager()
    private val appThread = AppThread()

    // The rebuild has no servicemanager, so the app gets its first binder from send().
    private val activityManagerProxy =
        IActivityManager.Stub.asInterface(driver.send(activityManager, from = server, to = app))

    // region attach
    @Test
    fun attachApplication_givesServerAProxy_andTheValue() {
        activityManagerProxy.attachApplication(appThread, startSeq = 7)
        val record = activityManager.records.single()
        assertInstanceOf(BinderProxy::class.java, record.thread.asBinder())
        assertEquals(7L, record.startSeq)
    }
    // endregion

    @Test
    fun asInterface_returnsLocalObject_inItsOwnProcess() {
        assertSame(appThread, IApplicationThread.Stub.asInterface(appThread))
    }

    @Test
    fun recordFor_findsRecord_whenProxyIsNewButBinderIsSame() {
        activityManagerProxy.attachApplication(appThread, startSeq = 7)
        val record = activityManager.records.single()
        val newProxy = IApplicationThread.Stub.asInterface(record.thread.asBinder())
        assertNotSame(record.thread, newProxy)
        assertSame(record, activityManager.recordFor(newProxy))
    }

    // region identity
    @Test
    fun naiveDriver_losesIdentity_whenSameBinderCrossesTwice() {
        activityManagerProxy.attachApplication(appThread, startSeq = 7)
        val again = IApplicationThread.Stub.asInterface(driver.send(appThread, from = app, to = server))
        assertNotSame(activityManager.records.single().thread.asBinder(), again.asBinder())
        assertNull(activityManager.recordFor(again))
    }
    // endregion
}
