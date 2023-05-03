# rosreact

The ROS client library for ReactJS with TypeScript support.

## **Server-side (ROS) configuration**

**IMPORTANT**: This library works in combination with the websocket server available in the **rosbridge_server** package, as it depends from the [roslibjs library](https://www.npmjs.com/package/roslib), and with the **web_video_server** package for video streaming. Run these commands to start the server processes on your robot:

    $ roslaunch rosbridge_server rosbridge_websocket.launch

Second terminal:

    $ rosrun web_video_server web_video_server

Check out the configuration options if you want to change ip address, port, available topics and services, etc.

If you need to install the packages, run:

    $ sudo apt-get install ros-DISTRO-rosbridge-suite
    $ sudo apt-get install ros-DISTRO-web-video-server

Don't forget to replace DISTRO with your ROS distribution - *noetic*, *melodic*, ...



## **Available Components and Hooks (Basic Usage)**

1. RosConnection - COMPONENT: setup the connection. Wraps all other ROS components except ImageViewer
2. Subscriber - COMPONENT: setup and execute a subscriber. Components wrapped by this subscriber will have access to incoming messages through the *useMsg* hooks.
3. useSubscription - HOOK: All-In-One version of subscriber as a react hook, good to be used inside any component.
4. useMsg - HOOK: Use this hook in a component wrapped by a *Subscriber* to get access to incoming messages.
5. Publisher - COMPONENT: setup and execute a publisher
6. ImageViewer - COMPONENT: view streaming from web_video_server http streaming server.
7. ServiceCaller - COMPONENT: call service
8. useServiceCall - HOOK: Provides callback and promise-based functions for service calls as a hook.
9. ServiceServer - COMPONENT: setup a service server
10. Param - COMPONENT: get, set, or delete a ros parameters from the server parameters
11. useParam - HOOK: use in a component wrapped by a Param component to get the parameter value.
12. TopicListProvider - COMPONENT
13. useTopicList - HOOK
14. ParamListProvider - COMPONENT
15. useParamList - HOOK
16. ServiceListProvider - COMPONENT
17. useServiceList - HOOK

### **Example**

    import React, {useEffect, useState, Fragment} from "react";

    import { 
        RosConnection, 
        ImageViewer, 
        Subscriber, 
        TopicListProvider, 
        useMsg, 
        useTopicList, 
        Publisher, 
        Param, 
        useParam, 
        ParamListProvider, 
        useParamList, 
        ServiceListProvider, 
        useServiceList, 
        ServiceCaller, 
        ServiceServer
    } from "rosreact";

    function App() {

        const [trigger, setTrigger] = useState(false);
        const [delParam, setDelParam] = useState(false);
        const [message, setMessage] = useState({data: 0});

        useEffect(() => {
            setTimeout(() => {
                setTrigger(!trigger);
            }, 3000);
        }, [trigger])

        useEffect(() => {
            setTimeout(() => {
                setMessage({data: 4});
            }, 3000);
        }, [])

        useEffect(() => {
            setTimeout(() => {
                setDelParam(true);
            }, 10000);
        }, [])

        return (
            <div>
                {/* All ROS components are wrapped into a RosConnection */}
                <RosConnection url={"ws://127.0.0.1:9090"} autoConnect>
                    
                    <Subscriber
                        topic="/number"
                        messageType="std_msgs/Float32"
                    >
                        <MsgView/>
                    </Subscriber>
                    
                    <Param 
                        name="/react/param"
                        setValue={1}
                        get={trigger}
                        delete={delParam}
                        deleteCallback={(resp) => {console.log(resp)}}
                        setCallback={(resp) => {console.log(resp)}}
                    >
                        <ParamView/>
                    </Param>
                    
                    <Publisher 
                        autoRepeat 
                        topic="/react/pub/repeat"
                        throttleRate={10.0} 
                        message={{data: 2}} 
                        messageType="std_msgs/Float32"
                    />
                    
                    <Publisher 
                        topic="/react/pub/norepeat"
                        throttleRate={10.0} 
                        message={message} 
                        messageType="std_msgs/Float32"
                        latch={true}
                    />

                    <ServiceServer 
                        name="/react/service" 
                        serviceType="std_srvs/SetBool" 
                        callback={serviceServerCallback}
                    />

                    <ServiceCaller 
                        name="/setbool" 
                        serviceType="std_srvs/SetBool" 
                        request={{data: true}} 
                        trigger={trigger}
                        callback={(resp) => {console.log(resp)}} 
                        failedCallback={(error) => {console.log(error)}}
                    />
                    
                    <TopicListProvider
                        trigger={trigger} 
                        failedCallback={(e) => {console.log(e)}}
                    >
                        <TopicListView/>
                    </TopicListProvider>
                    
                    <ServiceListProvider
                        trigger={trigger}
                        failedCallback={(e) => {console.log(e)}}
                    >
                        <ServiceListView/>
                    </ServiceListProvider>
                    
                    <ParamListProvider
                        trigger={trigger} 
                        failedCallback={(e) => {console.log(e)}}
                    >
                        <ParamListView/>
                    </ParamListProvider>
                
                </RosConnection>
                
                <ImageViewer topic="/camera"/>
            </div>
        )
    }

    const serviceServerCallback = (request, response) => {
        if (request.data === true) {
            response.success = true;
            response.message = "Passed true value";
        } else {
            response.success = false;
            response.message = "Passed false value";
        }
    }

    const ParamView = () => {
        const param = useParam();
        return <p>{`${param}`}</p>
    }


    const MsgView = () => {
        const msg = useMsg();
        return <p> {`${msg.distance}`} </p>
    }


    const TopicListView = () => {
        const topicList = useTopicList();
        return ( 
            <Fragment>
            <p>{`${topicList.topics}`}</p>
            <p>{`${topicList.types}`}</p>
            </Fragment>
        );
    }


    const ServiceListView = () => {
        const list = useServiceList();
        return (
            <p>{`${list}`}</p>
        );
    }


    const ParamListView = () => {
        const list = useParamList();
        return ( 
            <p>{`${list}`}</p>
        );
    }

Use an IDE such as VsCode or PyCharm to explore available component props using auto-completion. Refined documentation and use cases will be available asap.


## **Available low-level functions**

1. useRos - HOOK: use this hook to get the *ros* object, needed to interact with the server.
2. connect - FUNC: connect the *ros* object to the server websocket.
3. closeConnection - FUNC: disconnect the *ros* object to the server websocket.
4. setupConnectionCallbacks - FUNC: attach callbacks for connection events to the *ros* object.
5. getTopic - FUNC: get a *topic* object to perform subscribe/publish operations (topic methods)

Use the roslib library to perform other low-level operations. You just need to retrieve the current *ros* object by using the *useRos* hook in any of your React components.


## **Migration Guide from roslib-reactjs**

This library replace the legacy version roslib-reactjs (no more available online). Unfortunately, there are breaking changes to the API.

1. RosConnect --> RosConnection; timeout --> autoConnectTimeout.
2. Subscriber: name --> topic; type --> messageType; rate --> throttleRate; queue_size --> queueSize; queueLength, latch, and customCallback props have been added. With customCallback, subscriber can be used as a standalone component. The customCallback takes as input the new incoming message, that can then be manipulated.
3. Publisher: name --> topic;  type --> messageType; rate --> throttleRate; queue_size --> queueSize. Added queueLength and latch props.
4. ImageDisplay --> ImageViewer; transport --> encoding; defaultTransport --> transportLayer; snapshot has been removed; bitrate, qmin, qmax, gop, vp8Quality props are available to configure stream with vp8 encoding.
5. ServiceServer, ServiceCaller: toggler --> trigger; type --> serviceType.
6. GetParam, SetParam, DeleteParam --> only component Param; get, set, and delete operations can be done using props.

