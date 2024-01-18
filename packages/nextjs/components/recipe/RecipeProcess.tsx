import { useState } from "react";
import { Address as AddressType, parseEther, Hex } from "viem";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import {AddressInput, BytesInput, IntegerInput} from "~~/components/scaffold-eth";
import {ClipboardDocumentListIcon} from "@heroicons/react/24/outline";

export const RecipeProcess = () => {
    const [pubActedProfileId, setPubActedProfileId] = useState(1n);
    const [pubActedPostId, setPubActedPostId] = useState(1n);
    const [actorProfileId, setActorProfileId] = useState(1n);
    const [actorProfileAddress, setActorProfileAddress] = useState<AddressType>();
    const [txExecutorAddress, setTxExecutorAddress] = useState<AddressType>();
    const [refererProfileIds, setReferrerProfileIds] = useState<bigint[]>([]);
    const [refererPubIds, setReferrerPubIds] = useState<bigint[]>([]);
    const [refererPubTypes, setReferrerPubTypes] = useState<number[]>([]);
    const [actionModuleData, setActionModuleData] = useState<Hex>("0x");

    const { writeAsync, isLoading } = useScaffoldContractWrite({
        contractName: "RecipeActionModule",
        functionName: "processPublicationAction",
        args: [pubActedProfileId, pubActedPostId, actorProfileId, actorProfileAddress, txExecutorAddress, refererProfileIds, refererPubIds, refererPubTypes, actionModuleData],
        value: "0.01",
        onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
        },
    });

    return (
        <>
            <div className="card card-compact bg-secondary text-primary-content shadow-xl m-4">
                <div className="card-body items-center text-center">
                    <div className="flex flex-col items-center pt-4 max-md:row-start-1">
                        <span className="text-xl">Add Recipe to Cookbook</span>
                        <div className="flex flex-col mt-2 px-7 py-4 bg-primary opacity-80 rounded-2xl shadow-lg border-2 border-base-300 ">
                            <span className="text-accent-content">Publication Acted on Profile ID</span>
                            <IntegerInput value={pubActedProfileId ?? 1n} onChange={value => setPubActedProfileId(value)} />
                            <span className="text-accent-content">Publication Acted on Post ID</span>
                            <IntegerInput value={pubActedPostId ?? 1n} onChange={value => setPubActedPostId(value)} />
                            <span className="text-accent-content">Actor Profile ID</span>
                            <IntegerInput value={actorProfileId ?? 1n} onChange={value => setActorProfileId(value)} />
                            <span className="text-accent-content">Actor Profile Address</span>
                            <AddressInput
                                placeholder="0x"
                                value={actorProfileAddress ?? ""}
                                onChange={value => setActorProfileAddress(value)}
                            />
                            <span className="text-accent-content">TX Executor Address</span>
                            <AddressInput
                                placeholder="0x"
                                value={txExecutorAddress ?? ""}
                                onChange={value => setTxExecutorAddress(value)}
                            />
                            <span className="text-accent-content">Hex Data</span>
                            <BytesInput value={actionModuleData ?? "0x0"} onChange={value => setActionModuleData(value)} />
                            <br />
                            <button className="btn btn-secondary btn-sm" onClick={() => writeAsync()} disabled={isLoading}>
                                { !isLoading ? (
                                    <ClipboardDocumentListIcon className="h-6 w-6" />
                                ) : ( <span className="loading loading-spinner loading-sm"></span>)}
                                <span>Add Recipe</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
