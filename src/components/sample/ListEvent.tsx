import React from "react";
import { IEvents } from "../../models/Events";

export const ListEvent: React.FC<IEvents> = (evt: IEvents) => {

  return (
    <li>
      <div>
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