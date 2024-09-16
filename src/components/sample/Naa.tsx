import React from "react";
import {
  IPublicClientApplication,
  createNestablePublicClientApplication
} from "@azure/msal-browser";
import { nestedAppAuth } from "@microsoft/teams-js";
import Axios from "axios";
import { Button } from '@fluentui/react-components';
import { IEvents } from "../../models/Events";
import { ListEvent } from "./ListEvent";
import { start } from "repl";

export const Naa: React.FC<{}> = () => {
  const [events, setEvents] = React.useState<IEvents[]>([]);
  const [loggedin, setLoggedin] = React.useState(false);
  const [token, setToken] = React.useState("");

  const msalConfig = {
    auth: {
      clientId: `${process.env.REACT_APP_CLIENT_ID}`,
      authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID}`,
      supportsNestedAppAuth: true
    },
  };
  
  let pca: IPublicClientApplication;
  
  function initializePublicClient() {
    console.log("Starting initializePublicClient");
    return createNestablePublicClientApplication(msalConfig).then(
      (result) => {
        console.log("Client app created");
        pca = result;
        return pca;
      }
    );
  }

  const getAccount = async () => {
    // MSAL.js exposes several account APIs, logic to determine which account to use is the responsibility of the developer
    const account = pca.getActiveAccount();

    const accessTokenRequest = {
      scopes: ["user.read", "Calendars.Read"],
      account: account || undefined,
    };

    pca
      .acquireTokenSilent(accessTokenRequest)
      .then(function (accessTokenResponse) {
        // Acquire token silent success
        setToken(accessTokenResponse.accessToken);
        setLoggedin(true);
        // Call your API with token
        console.log(accessTokenResponse.accessToken);
        callEvents(accessTokenResponse.accessToken);
      })
      .catch(function (error) {
        console.log(error);
        // Try to get token via popup if silent acquisition fails
        return pca.acquireTokenPopup(accessTokenRequest)
          .then(async (result) => {
            console.log(result);
            setLoggedin(true);
            return result.accessToken;
          })
          .catch((error) => {
            console.error(error); // Log the error for debugging purposes
            return undefined; // Return undefined to indicate an error occurred
          });//Acquire token silent failure, and send an interactive request
      });
  };

  const apicall = async () => {
    if (loggedin) {
      callEvents(token);
    }
    else {
      let isNAAResults = await nestedAppAuth.isNAAChannelRecommended();
      if (isNAAResults === true) {
        return initializePublicClient().then((_client) => {
          pca = _client;
          console.log(_client);
          getAccount();
        });
      } 
      {

      }
    }
  };

  const callEvents = async (accessToken: string) => {
    const currentDate = new Date().toISOString();
    Axios.get(`https://graph.microsoft.com/v1.0/me/events?$orderby=start/dateTime desc&$top=5&$select=subject,start,end&$filter=start/dateTime le '${currentDate}'`, 
      {
        responseType: "json",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).then(result => {
        console.log(result.data);
        let eventResult: IEvents[] = [];
        result.data.value.forEach((element: any) => {
          let start: string = element.start.dateTime as string;
          start = start.substring(0,10) + " " + start.substring(12,19);
          let end: string = element.end.dateTime as string;
          end = end.substring(0,10) + " " + end.substring(12,19);
          eventResult.push(
            { Id: element.id, Subject: element.subject, Start: start, End: end }
          )
        });
        setEvents(eventResult);        
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <div>
      <div className="">
        <h1>Last Events</h1>
      </div>
      <div>
        <ul>
          {events.map(rel => (
            <ListEvent Id={rel.Id} Subject={rel.Subject} Start={rel.Start} End={rel.End} />
          ))}
        </ul>
      </div>
      <div>
        <Button appearance="primary" onClick={apicall}>Login</Button>
      </div>
    </div>
  );
}