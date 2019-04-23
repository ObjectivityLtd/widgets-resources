import { actionValue } from "@native-components/util-widgets/test";
import { createElement } from "react";
import { AppStateStatus } from "react-native";
import { flushMicrotasksQueue, render } from "react-native-testing-library";

import { AppEvents, Props } from "../AppEvents";

let appStateChangeHandler: ((state: AppStateStatus) => void) | undefined;
let connectionChangeHandler: ((result: boolean) => void) | undefined;

jest.mock("react-native", () => ({
    AppState: {
        currentState: "active",
        addEventListener: jest.fn((_type, listener) => (appStateChangeHandler = listener)),
        removeEventListener: jest.fn(() => (appStateChangeHandler = undefined))
    },
    NetInfo: {
        isConnected: {
            fetch: jest.fn(() => Promise.resolve(true)),
            addEventListener: jest.fn((_type, listener) => (connectionChangeHandler = listener)),
            removeEventListener: jest.fn(() => (connectionChangeHandler = undefined))
        }
    }
}));

const defaultProps: Props = {
    onResumeTimeout: 0,
    onOnlineTimeout: 0,
    onOfflineTimeout: 0,
    delayTime: 30,
    timerType: "once",
    style: []
};

describe("AppEvents", () => {
    afterEach(() => {
        appStateChangeHandler = undefined;
        connectionChangeHandler = undefined;
    });

    it("does not render anything", () => {
        const component = render(<AppEvents {...defaultProps} />);

        expect(component.toJSON()).toBeNull();
    });

    describe("with on load action", () => {
        it("executes the on load action", () => {
            const onLoadAction = actionValue();
            render(<AppEvents {...defaultProps} onLoadAction={onLoadAction} />);

            expect(onLoadAction.execute).toHaveBeenCalledTimes(1);
        });
    });

    describe("with on resume action", () => {
        it("registers and unregisters an event listener", () => {
            const onResumeAction = actionValue();
            const component = render(<AppEvents {...defaultProps} onResumeAction={onResumeAction} />);

            expect(appStateChangeHandler).toBeDefined();
            component.unmount();
            expect(appStateChangeHandler).toBeUndefined();
        });

        it("executes the on resume action", () => {
            const onResumeAction = actionValue();
            render(<AppEvents {...defaultProps} onResumeAction={onResumeAction} />);

            appStateChangeHandler!("background");
            appStateChangeHandler!("active");
            expect(onResumeAction.execute).toHaveBeenCalledTimes(1);
        });

        it("does not execute the on resume action when the app state hasn't changed", () => {
            const onResumeAction = actionValue();
            render(<AppEvents {...defaultProps} onResumeAction={onResumeAction} />);

            appStateChangeHandler!("active");
            appStateChangeHandler!("active");
            expect(onResumeAction.execute).toHaveBeenCalledTimes(0);
        });

        it("only executes the on resume action after the timeout passed", () => {
            const dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(0);

            const onResumeAction = actionValue();
            render(<AppEvents {...defaultProps} onResumeAction={onResumeAction} onResumeTimeout={5} />);

            dateNowSpy.mockReturnValue(4000);
            appStateChangeHandler!("background");
            appStateChangeHandler!("active");
            expect(onResumeAction.execute).toHaveBeenCalledTimes(0);

            dateNowSpy.mockReturnValue(6000);
            appStateChangeHandler!("background");
            appStateChangeHandler!("active");
            expect(onResumeAction.execute).toHaveBeenCalledTimes(1);

            dateNowSpy.mockRestore();
        });
    });

    describe("with on online action", () => {
        it("registers and unregisters an event listener", async () => {
            const onOnlineAction = actionValue();
            const component = render(<AppEvents {...defaultProps} onOnlineAction={onOnlineAction} />);
            await flushMicrotasksQueue();

            expect(connectionChangeHandler).toBeDefined();
            component.unmount();
            expect(connectionChangeHandler).toBeUndefined();
        });

        it("executes the on online action", async () => {
            const onOnlineAction = actionValue();
            render(<AppEvents {...defaultProps} onOnlineAction={onOnlineAction} />);
            await flushMicrotasksQueue();

            connectionChangeHandler!(false);
            connectionChangeHandler!(true);
            expect(onOnlineAction.execute).toHaveBeenCalledTimes(1);
        });

        it("only executes the on online action after the timeout passed", async () => {
            const dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(0);

            const onOnlineAction = actionValue();
            render(<AppEvents {...defaultProps} onOnlineAction={onOnlineAction} onOnlineTimeout={5} />);
            await flushMicrotasksQueue();

            dateNowSpy.mockReturnValue(4000);
            connectionChangeHandler!(false);
            connectionChangeHandler!(true);
            expect(onOnlineAction.execute).toHaveBeenCalledTimes(0);

            dateNowSpy.mockReturnValue(6000);
            connectionChangeHandler!(false);
            connectionChangeHandler!(true);
            expect(onOnlineAction.execute).toHaveBeenCalledTimes(1);

            dateNowSpy.mockRestore();
        });

        it("does not execute the on online action if the connection state didn't change", async () => {
            const onOnlineAction = actionValue();
            render(<AppEvents {...defaultProps} onOnlineAction={onOnlineAction} />);
            await flushMicrotasksQueue();

            connectionChangeHandler!(true);
            connectionChangeHandler!(false);
            connectionChangeHandler!(false);
            expect(onOnlineAction.execute).toHaveBeenCalledTimes(0);
        });
    });

    describe("with on timeout action", () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it("executes the on timeout action once after the timeout has passed", () => {
            const onTimeoutAction = actionValue();
            render(<AppEvents {...defaultProps} onTimeoutAction={onTimeoutAction} />);

            expect(onTimeoutAction.execute).toHaveBeenCalledTimes(0);
            jest.advanceTimersByTime(30000);
            expect(onTimeoutAction.execute).toHaveBeenCalledTimes(1);
            jest.advanceTimersByTime(30000);
            expect(onTimeoutAction.execute).toHaveBeenCalledTimes(1);
        });

        it("does not execute the on timeout action after the component has been unmounted", () => {
            const onTimeoutAction = actionValue();
            const component = render(<AppEvents {...defaultProps} onTimeoutAction={onTimeoutAction} />);
            jest.advanceTimersByTime(15000);
            component.unmount();
            jest.advanceTimersByTime(15000);
            expect(onTimeoutAction.execute).toHaveBeenCalledTimes(0);
        });

        it("executes the interval on timeout action after every interval", () => {
            const onTimeoutAction = actionValue();
            render(<AppEvents {...defaultProps} onTimeoutAction={onTimeoutAction} timerType={"interval"} />);

            expect(onTimeoutAction.execute).toHaveBeenCalledTimes(0);
            jest.advanceTimersByTime(30000);
            expect(onTimeoutAction.execute).toHaveBeenCalledTimes(1);
            jest.advanceTimersByTime(30000);
            expect(onTimeoutAction.execute).toHaveBeenCalledTimes(2);
        });

        it("does not execute the interval on timeout action after the component has been unmounted", () => {
            const onTimeoutAction = actionValue();
            const component = render(
                <AppEvents {...defaultProps} onTimeoutAction={onTimeoutAction} timerType={"interval"} />
            );

            jest.advanceTimersByTime(30000);
            expect(onTimeoutAction.execute).toHaveBeenCalledTimes(1);
            component.unmount();
            jest.advanceTimersByTime(30000);
            expect(onTimeoutAction.execute).toHaveBeenCalledTimes(1);
        });
    });
});