import "./App.css";
import React, { useState } from "react";
import { WebPubSubClient } from "@azure/web-pubsub-client";

function UserChat({ from, message }) {
  return (
    <div className="align-self-start">
      <small className="text-muted font-weight-light">from {from}</small>
      <p className="alert alert-primary text-break">{message}</p>
    </div>
  );
}

function SelfChat({ message }) {
  return <div className="align-self-end alert-success alert">{message}</div>;
}
/**
 message:{
  id:number,
  group: cli,
  sectionsLocked: []
 }
 */
const App = () => {
  const [user, setUser] = useState("");
  const [group, setGroup] = useState("");
  const [locked, setLocked] = useState({});
  const [message, setMessage] = useState({});
  const [chats, setChats] = useState([]);
  const [connected, setConnected] = useState(false);
  const [client, setClient] = useState(null);
  const [section, setSection] = useState("");
  const [subsection, setSubsection] = useState("");

  async function connect() {
    const client = new WebPubSubClient({
      getClientAccessUrl: async() => (await fetch("/negotiate?userId="+user)).text(),
    });
    client.on("group-message", (e) => {
      const data = e.message.data;
      alert(JSON.stringify(e))
      // appendMessage(data);
    });
    client.on("connected", (e)=>{
      alert(JSON.stringify(e));
    //   client.sendEvent(JSON.stringify({
    //     type: "event",
    //     event: "newUserAdded",
    //     data: { "message": "Send me update!" }
    // }));
    })
    client.on("newUserAdded", (e)=>{
      alert('test')
      client.sendToGroup(group, JSON.stringify(message), "json", { noEcho: true });    
    })
    await client.start();
    await client.joinGroup(group);
    
    setConnected(true);
    setClient(client);
  }

  async function sectionClick(){
    let msg;
    if(locked.length===0){
      msg = {
        user: user,
        lockedSection: section  
      }
      appendMessage(msg);
      
    }else{
      const lockedItem = chats.find(e => e.lockedSection===section);
      if(lockedItem && lockedItem.user!==user)
      {
        alert("blocked!!!")
      }else if(lockedItem && lockedItem.user===user)
      {
        alert("welcome!!!")
      }else{
        msg = {
          user: user,
          lockedSection: section  
        }
        appendMessage(msg);
        // const chat = {
        //   from: user,
        //   message: chats,
        // };
        // await client.sendToGroup(group, chat, "json", { noEcho: true });
      }
    } 
  }
  

  async function subsectionClick(){
    // let msg;
    // if(message.locked.length===0){
    //   msg = {
    //     locked: [{
    //       user: user,
    //       lockedSection: subsection  
    //     }]
    //   }
    //   setMessage(msg);
    //   const chat = {
    //     from: user,
    //     message: message,
    //   };
    //   await client.sendToGroup(group, chat, "json", { noEcho: true });
    // }else{
    //   const lockedItem = message.locked.find(e => e.lockedSection===subsection);
    //   if(lockedItem && lockedItem.user!==user)
    //   {
    //     alert("blocked!!!")
    //   }else if(lockedItem && lockedItem.user===user)
    //   {
    //     alert("welcome!!!")
    //   }else{
    //     msg = {
    //       locked: [...message.locked,{
    //         user: user,
    //         lockedSection: subsection  
    //       }]
    //     }
    //     setMessage(msg => msg);
    //     await client.sendToGroup(group, message, "json", { noEcho: true });
    //   }
    // } 
  }

  async function send() {
    const chat = {
      from: user,
      message: message,
    };
    await client.sendToGroup(group, chat, "json", { noEcho: true });
    appendMessage(chat);
  }

  function appendMessage(data) {
    setChats((prev) => [...prev, data], async()=> {
      const chat = {
        from: user,
        message: chats,
      };
      await client.sendToGroup(group, chat, "json", { noEcho: true });
    });
  }

  const loginPage = (
    <div className="d-flex h-100 flex-column justify-content-center container">
      <div className="input-group m-3">
        <input
          autoFocus
          type="text"
          className="form-control"
          placeholder="Username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        ></input>
        <input
          autoFocus
          type="text"
          className="form-control"
          placeholder="Group"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        ></input>
        <div className="input-group-append">
          <button
            className="btn btn-primary"
            type="button"
            disabled={!user}
            onClick={connect}
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
  const messagePage = (
    <div className="h-100 container">
      <div className="chats d-flex flex-column m-2 p-2 bg-light h-100 overflow-">
        {chats.map((item, index) =>
          item.from === user ? (
            <SelfChat key={index} message={item.message} />
          ) : (
            <UserChat key={index} from={item.from} message={item.message} />
          )
        )}
      </div>
      <div className="input-group m-3">
        
        <input
          autoFocus
          type="text"
          className="form-control"
          placeholder="section"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        ></input>
        <input
          autoFocus
          type="text"
          className="form-control"
          placeholder="subsection"
          value={subsection}
          onChange={(e) => setSubsection(e.target.value)}
        ></input>
        <div className="input-group-append">
          <button className="btn btn-primary" type="button" onClick={send}>
            Send
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={sectionClick}
          >
            Section
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={subsectionClick}
          >
            Subsection
          </button>
        </div>
      </div>
    </div>
  );
  return !connected ? loginPage : messagePage;
}

export default App;



// import React from 'react';
// import './App.css';
// import Header from './pages/Header';
// import Navbar from './pages/Navbar';
// import Content from './pages/Content';
// import Sidebar from './pages/Sidebar';
// import Footer from './pages/Footer';

// function App() {
//   return (
//     <div>
//       <Header />
//       <Navbar />
//       <div className="row">
//         <Sidebar />
//         <Content />
//       </div>
//       <Footer />
//     </div>
//   );
// }

// export default App;