import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { module } from "@lens-protocol/metadata";
import { uploadMetadata } from "../lib/irys-service";

/**
 * Generates the metadata for the RecipeActionModule.sol contract compliant with the Module Metadata Standard at:
 * https://docs.lens.xyz/docs/module-metadata-standard
 */
const metadata = module({
  name: "RecipeActionModule",
  title: "Recipe Open Action",
  description: "Allow users to add a recipe to their cookbook from the creator of a publication",
  authors: ["hashwarlock@phala.network"],
  initializeCalldataABI: JSON.stringify([
    {
      type: "address",
      name: "tipReceiver",
    },
    {
      type: "address",
      name: "cookBook",
    },
    {
      type: "uint256",
      name: "cookBookId",
    },
    {
      type: "string",
      name: "recipeMetadata",
    },
  ]),
  processCalldataABI: JSON.stringify([
    {
      type: "address",
      name: "currency",
    },
    {
      type: "uint256",
      name: "tipAmount",
    },
    {
      type: "address",
      name: "cookBook",
    },
    {
      type: "uint256",
      name: "cookBookId",
    },
  ]),
  attributes: [],
});

const deployRecipeActionModuleContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  // This is the address of the LensHub contract on the network we're deploying to
  // When running locally, this should be the address of burner wallet used in the nextjs app
  const lensHubAddress = process.env.LENS_HUB ?? "0x5de679113eA5fdC6a0239fBbBb8C476456dD4A1A";

  // First check to see if there's a local mocked ModuleRegistry contract deployed
  // This allows us to run tests locally with the same flow as on-chain
  let moduleRegistry: string | undefined;
  try {
    const { address } = await get("MockModuleRegistry");
    moduleRegistry = address;
  } catch (e) {}

  // If there's no local mocked ModuleRegistry, use the live address from the environment
  if (!moduleRegistry) {
    moduleRegistry = process.env.MODULE_REGISTRY;
  }

  // Deploy the RecipeActionModule.sol contract
  await deploy("RecipeActionModule", {
    from: deployer,
    args: [lensHubAddress, moduleRegistry],
    log: true,
    autoMine: true,
  });

  const recipePublicationAction = await hre.ethers.getContract("RecipeActionModule", deployer);

  // Upload the metadata to Arweave with Irys and set the URI on the contract
  const metadataURI = await uploadMetadata(metadata);
  await recipePublicationAction.setModuleMetadataURI(metadataURI);

  // Add a delay before calling registerModule to allow for propagation
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Register the module with the ModuleRegistry
  const registered = await recipePublicationAction.registerModule();
  console.log("registered open action: tx=", registered.hash);
};

export default deployRecipeActionModuleContract;

deployRecipeActionModuleContract.tags = ["RecipeActionModule"];
