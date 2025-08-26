import React,{useState} from "react"
import { VscBell,VscAccount } from "react-icons/vsc";
import { CiSettings } from "react-icons/ci";
import { AiOutlineRobot } from "react-icons/ai";
import NotificationClient from "./components/notification"

export default function Header(){
    const [activeNotif,SetActiveNotif]=useState(false);
    const activateNotif=()=>{
        
        SetActiveNotif(!activeNotif);
        
        
    }
    return(
        <section className="border-b-1 border-gray-500 h-[150px] w-full pr-[80px]">
            <nav className="w-full flex gap-[220px] pt-[20px]">
                <div className="w-[250px] m-[15px]"></div>
                <div className="w-[600px] w-[600px] m-[15px]">
                <input placeholder="chercher" className="w-full rounded-[20px] border border-gray-500 pl-[10px] pr-[10px]"  type="text"/> 
                </div>
                <div className="flex justify-around gap-[15px]">
                    <AiOutlineRobot size={25} />
                    <div>
                        <VscBell onClick={activateNotif} size={25}/>
                        {activeNotif &&
                        <NotificationClient/>
                        }
                    </div>
                    <CiSettings size={25}/>
                    <VscAccount size={25}/>
                </div>
            </nav>
            <div>

            </div>
        </section>
    );
}