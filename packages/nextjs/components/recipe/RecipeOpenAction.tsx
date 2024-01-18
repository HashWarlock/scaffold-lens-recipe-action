import { useState } from "react";
import { Address as AddressType, parseEther, Hex } from "viem";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import {AddressInput, BytesInput, IntegerInput} from "~~/components/scaffold-eth";
import {BookOpenIcon} from "@heroicons/react/24/outline";

export const RecipeOpenAction = () => {
    const [profileId, setProfileId] = useState(1n);
    const [postId, setPostId] = useState(1n);
    const [txExecutorAddress, setTxExecutorAddress] = useState<AddressType>();
    const [callData, setCallData] = useState<Hex>("0x");

    const { writeAsync, isLoading } = useScaffoldContractWrite({
        contractName: "RecipeActionModule",
        functionName: "initializePublicationAction",
        args: [profileId, postId, txExecutorAddress, callData],
        onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
        },
    });

    return (
        <>
            <div className="card card-compact bg-secondary text-primary-content shadow-xl m-4">
                <div className="card-body items-center text-center">
                    <div className="flex flex-col items-center pt-4 max-md:row-start-1">
                        <span className="text-xl">Publish New Recipe</span>
                        <div className="flex flex-col mt-2 px-7 py-4 bg-primary opacity-80 rounded-2xl shadow-lg border-2 border-base-300 ">
                            <span className="text-accent-content">Profile ID</span>
                            <IntegerInput value={profileId ?? 1n} onChange={value => setProfileId(value)} />
                            <span className="text-accent-content">Post ID</span>
                            <IntegerInput value={postId ?? 1n} onChange={value => setPostId(value)} />
                            <span className="text-accent-content">TX Executor Address</span>
                            <AddressInput
                                placeholder="0x"
                                value={txExecutorAddress ?? ""}
                                onChange={value => setTxExecutorAddress(value)}
                            />
                            <span className="text-accent-content">Hex Data</span>
                            <BytesInput value={callData ?? "0x0"} onChange={value => setCallData(value)} />
                            <br />
                            <button className="btn btn-secondary btn-sm" onClick={() => writeAsync()} disabled={isLoading}>
                                { !isLoading ? (
                                    <BookOpenIcon className="h-6 w-6" />
                                ) : ( <span className="loading loading-spinner loading-sm"></span>)}
                                <span>Create Recipe</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
