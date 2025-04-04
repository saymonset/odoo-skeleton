import { lockBusServiceStart, lockWebsocketConnect } from "@bus/../tests/bus_test_helpers";
import { WEBSOCKET_CLOSE_CODES } from "@bus/workers/websocket_worker";
import { describe, expect, test } from "@odoo/hoot";
import { queryFirst, runAllTimers, waitFor, waitUntil } from "@odoo/hoot-dom";
import { asyncStep, MockServer, waitForSteps } from "@web/../tests/web_test_helpers";
import { defineMailModels, openDiscuss, start } from "@mail/../tests/mail_test_helpers";

defineMailModels();
describe.current.tags("desktop");

test("show warning when bus connection encounters issues", async () => {
    const unlockBus = lockBusServiceStart();
    const env = await start();
    env.services.bus_service.addEventListener("connect", () => asyncStep("connect"));
    env.services.bus_service.addEventListener("reconnecting", () => asyncStep("reconnecting"));
    env.services.bus_service.addEventListener("reconnect", () => asyncStep("reconnect"));
    unlockBus();
    await openDiscuss();
    await env.services.bus_service.start();
    await waitForSteps(["connect"]);
    const unlockWebsocket = lockWebsocketConnect();
    MockServer.env["bus.bus"]._simulateDisconnection(WEBSOCKET_CLOSE_CODES.ABNORMAL_CLOSURE);
    await waitForSteps(["reconnecting"]);
    const alert = await waitFor(".o-bus-ConnectionAlert");
    expect(alert).toHaveText("Real-time connection lost...");
    await runAllTimers();
    expect(alert).toHaveText("Real-time connection lost...");
    unlockWebsocket();
    await waitForSteps(["reconnect"]);
    await runAllTimers();
    await waitUntil(() => !queryFirst(".o-bus-ConnectionAlert"));
});
