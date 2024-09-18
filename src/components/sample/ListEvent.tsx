import React from "react";
import { IEvents } from "../../models/Events";
import "./ListEvent.css";

export const ListEvent: React.FC<IEvents> = (evt: IEvents) => {

  return (
    <li key={evt.Id}>
      <div className="subject">
        {evt.Subject}
      </div>
      <div>
        {evt.Start}
      </div>
      <div>
        {evt.End}
      </div>
    </li>
  );
}