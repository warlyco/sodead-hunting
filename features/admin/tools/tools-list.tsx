import { Panel } from "@/features/UI/panel";
import {
  BugAntIcon,
  FingerPrintIcon,
  HandRaisedIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { useDebugMode } from "@/hooks/debug-mode";
import Link from "next/link";
import axios from "axios";
import showToast from "@/features/toasts/show-toast";
import { useState } from "react";

export const ToolsList = () => {
  const { isDebugMode, setIsDebugMode } = useDebugMode();
  const [isPoking, setIsPoking] = useState(false);

  const pokeEndpoints = async () => {
    setIsPoking(true);
    const { data } = await axios.get("/api/poke-endpoints");
    showToast({ primaryMessage: data?.message || "Endpoints poked" });
    setIsPoking(false);
  };

  return (
    <Panel className="space-y-4">
      <button
        onClick={() => setIsDebugMode(!isDebugMode)}
        className="p-3 rounded-2xl bg-stone-900 flex items-center justify-center w-full text-stone-300 text-xl"
      >
        <BugAntIcon className="w-6 h-6 mr-2" />
        <div>{isDebugMode ? "Disable" : "Enable"} Debug Mode</div>
      </button>
      <Link
        href="/admin/fetch"
        className="p-3 rounded-2xl bg-stone-900 flex items-center justify-center w-full text-stone-300 text-xl"
      >
        <PlusCircleIcon className="w-6 h-6 mr-2" />
        Add creature
      </Link>
      <button
        onClick={() => pokeEndpoints()}
        className="p-3 rounded-2xl bg-stone-900 flex items-center justify-center w-full text-stone-300 text-xl"
        disabled={isPoking}
      >
        <HandRaisedIcon className="w-6 h-6 mr-2" />
        {isPoking ? "Poking..." : "Poke endpoints"}
      </button>
    </Panel>
  );
};
