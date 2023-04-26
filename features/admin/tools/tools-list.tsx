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
import { useLazyQuery } from "@apollo/client";
import { GET_VAMPIRES } from "@/graphql/queries/get-vampires";
import { Creature } from "@/features/creatures/creature-list";
import { BASE_URL } from "@/constants/constants";
import { GET_VAMPIRES_WITHOUT_TRAIT_HASH } from "@/graphql/queries/get-vampires-without-trait-hash";
import { ErrorInstance } from "@/utils/log-error";
import { useUser } from "@/hooks/user";
import { WarningAmber } from "@mui/icons-material";

export const ToolsList = () => {
  const { isDebugMode, setIsDebugMode } = useDebugMode();
  const [isPoking, setIsPoking] = useState(false);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(2000);
  const { user } = useUser();
  const [isLoggingTestError, setIsLoggingTestError] = useState(false);

  const [getAllCreatures, { data: creatures }] = useLazyQuery(
    GET_VAMPIRES_WITHOUT_TRAIT_HASH,
    {
      fetchPolicy: "cache-and-network",
      async onCompleted({
        sodead_creatures: creatures,
      }: {
        sodead_creatures: Creature[];
      }) {
        const creaturesToProcess = creatures.slice(start, end);

        for (const creature of creaturesToProcess) {
          console.log(`processing ${creature}`);
          const { data } = await axios.post(
            `${BASE_URL}/api/add-trait-combination-hash-to-creature`,
            {
              creatureId: creature.id,
            }
          );

          console.log(data);
        }

        showToast({
          primaryMessage: "Trait hashes added",
          secondaryMessage: `${creaturesToProcess.length} creatures processed`,
        });
      },
    }
  );

  const logTestError = async () => {
    setIsLoggingTestError(true);
    await axios.post("/api/test-error", {
      error: {
        code: 500,
        message: "test error",
        rawError: JSON.stringify({ test: "test" }),
      } as ErrorInstance,
      walletId: user?.primaryWallet?.id || user?.wallets?.[0]?.id,
      burnTxAddress: "test",
    });
    showToast({ primaryMessage: "Test error logged" });
    setIsLoggingTestError(false);
  };

  const pokeEndpoints = async ({
    shouldFetchConcurrently,
  }: {
    shouldFetchConcurrently: boolean;
  }) => {
    setIsPoking(true);
    const { data } = await axios.post("/api/poke-endpoints", {
      shouldFetchConcurrently,
    });
    showToast({ primaryMessage: data?.message || "Endpoints poked" });
    setIsPoking(false);
  };

  const addTraitHashes = async () => {
    await getAllCreatures();
  };

  return (
    <Panel className="space-y-4">
      <div className="flex items-center px-4">
        <div className="mr-2"># of hashes to fetch:</div>
        <input
          type="text"
          className="p-3 rounded-2xl bg-stone-900 flex items-center justify-center w-full text-stone-300 text-xl"
          placeholder="End"
          value={end}
          onChange={(event) => {
            setEnd(Number((event.target as HTMLInputElement).value));
          }}
        />
      </div>
      <button
        onClick={addTraitHashes}
        className="p-3 rounded-2xl bg-stone-900 flex items-center justify-center w-full text-stone-300 text-xl"
      >
        <div>Add trait hashes</div>
      </button>
      <button
        onClick={() => setIsDebugMode(!isDebugMode)}
        className="p-3 rounded-2xl bg-stone-900 flex items-center justify-center w-full text-stone-300 text-xl"
      >
        <BugAntIcon className="w-6 h-6 mr-2" />
        <div>{isDebugMode ? "Disable" : "Enable"} Debug Mode</div>
      </button>
      <button
        onClick={logTestError}
        className="p-3 rounded-2xl bg-stone-900 flex items-center justify-center w-full text-stone-300 text-xl"
      >
        <WarningAmber className="w-6 h-6 mr-2" />
        {isLoggingTestError ? "Logging..." : "Log test error"}
      </button>
      <Link
        href="/admin/fetch"
        className="p-3 rounded-2xl bg-stone-900 flex items-center justify-center w-full text-stone-300 text-xl"
      >
        <PlusCircleIcon className="w-6 h-6 mr-2" />
        Add creature
      </Link>
      <button
        onClick={() => pokeEndpoints({ shouldFetchConcurrently: true })}
        className="p-3 rounded-2xl bg-stone-900 flex items-center justify-center w-full text-stone-300 text-xl"
        disabled={isPoking}
      >
        <HandRaisedIcon className="w-6 h-6 mr-2" />
        {isPoking ? "Poking..." : "Poke endpoints (Concurrently)"}
      </button>
      <button
        onClick={() => pokeEndpoints({ shouldFetchConcurrently: false })}
        className="p-3 rounded-2xl bg-stone-900 flex items-center justify-center w-full text-stone-300 text-xl"
        disabled={isPoking}
      >
        <HandRaisedIcon className="w-6 h-6 mr-2" />
        {isPoking ? "Poking..." : "Poke endpoints (Sequentially)"}
      </button>
    </Panel>
  );
};
