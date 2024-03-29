import React from "react";
import { render, screen } from "@testing-library/react";
import {
  createMockCollection,
  createMockTimeline,
  createMockTimelineEvent,
} from "metabase-types/api/mocks";
import EventList, { EventListProps } from "./EventList";

describe("EventList", () => {
  it("should render a list of events", () => {
    const props = getProps({
      events: [
        createMockTimelineEvent({ id: 1, name: "RC1" }),
        createMockTimelineEvent({ id: 2, name: "RC2" }),
      ],
    });

    render(<EventList {...props} />);

    expect(screen.getByText("RC1")).toBeInTheDocument();
    expect(screen.getByText("RC2")).toBeInTheDocument();
  });
});

const getProps = (opts?: Partial<EventListProps>): EventListProps => ({
  events: [],
  timeline: createMockTimeline(),
  collection: createMockCollection(),
  ...opts,
});
