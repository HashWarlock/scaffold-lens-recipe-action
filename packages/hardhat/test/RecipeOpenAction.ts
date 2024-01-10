import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, ContractFactory } from "ethers";

describe("RecipeActionModule.sol", function () {
  const PROFILE_ID = 1;
  const PUBLICATION_ID = 1;
  const TIP_AMOUNT = "1";
  const recipeMetadata = JSON.stringify(`
      {
        "image": "ipfs://QmbMVTLrUb3CSW4Cytj8Nrv4VT72eGEcA57FpPtQgC2PRa/1-carbonara.jpg",
        "mediaUri": "ipfs://QmbMVTLrUb3CSW4Cytj8Nrv4VT72eGEcA57FpPtQgC2PRa/1-carbonara.jpg",
        "attributes":
        [
            {
                "label": "Level",
                "type": "string",
                "value": "Easy",
                "trait_type": "Level"
            }
        ],
        "name": "Spaghetti Carbonara",
        "description": "The recipe features creamy pasta with crisp bacon bits, grated Parmesan, and parsley, accompanied by clear, easy-to-follow instructions."
      }
    `);

  let RecipeActionModule: ContractFactory;
  let recipeOpenAction: Contract;
  let moduleRegistry: Contract;
  let cookBookContract: Contract;
  let ownerAddress: string;
  let recipientAddress: string;
  let aliceAddress: string;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    RecipeActionModule = await ethers.getContractFactory("RecipeActionModule");
    const [owner, recipient, alice] = await ethers.getSigners();

    ownerAddress = await owner.getAddress();
    recipientAddress = await recipient.getAddress();
    aliceAddress = await alice.getAddress();

    // Deploy a new mock ModuleRegistry contract
    const ModuleRegistry = await ethers.getContractFactory("MockModuleRegistry");
    moduleRegistry = await ModuleRegistry.deploy();
    await moduleRegistry.deployed();

    // Deploye CookBook NFT Collection
    const CookBook = await ethers.getContractFactory("CookBook");
    const args = ["ipfs://QmSU2R1ewXA7vmxD17KQTLRG1nu63KPxDmnb6xdtZ2Hmq5", BigNumber.from(100), ownerAddress, 500];

    cookBookContract = await CookBook.deploy(args);
    await cookBookContract.deployed();
    await cookBookContract
      .connect(owner)
      .mint(ownerAddress, 1, "ipfs://QmWcoQ7MvDRVCBZ2Xii3TtNYThdoibztG1gkutDHyS6KQk/masters-cookbook.json");
    await cookBookContract
      .connect(alice)
      .mint(aliceAddress, 1, "ipfs://QmWcoQ7MvDRVCBZ2Xii3TtNYThdoibztG1gkutDHyS6KQk/alices-cookbook.json");
    // Deploy a new RecipeActionModule.sol contract for each test
    recipeOpenAction = await RecipeActionModule.deploy(ownerAddress, moduleRegistry.address);
    await recipeOpenAction.deployed();
  });

  // Test case for supportsInterface function
  it("Should support the Lens Module interface", async function () {
    // Calculate the interface ID for 'LENS_MODULE'
    const interfaceID = ethers.utils.solidityKeccak256(["string"], ["LENS_MODULE"]);
    const bytes4InterfaceID = ethers.utils.hexDataSlice(interfaceID, 0, 4);

    // Call supportsInterface and check the result
    expect(await recipeOpenAction.supportsInterface(bytes4InterfaceID)).to.be.true;
  });

  // Test case for initializePublicationAction function
  it("Should initialize publication action", async function () {
    // Call the initializePublicationAction function
    const tx = await recipeOpenAction.initializePublicationAction(
      PROFILE_ID,
      PUBLICATION_ID,
      ownerAddress,
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "uint256", "string"],
        [recipientAddress, cookBookContract.address, 1, recipeMetadata],
      ),
    );

    await expect(tx)
      .to.emit(recipeOpenAction, "TipReceiverRegistered")
      .withArgs(PROFILE_ID, PUBLICATION_ID, recipientAddress);

    // Get the tip receiver
    const tipReceiver = await recipeOpenAction.getTipReceiver(1, 1);

    // Test if the tip receiver is correctly set
    expect(tipReceiver).to.equal(recipientAddress);
  });

  // Test case for processPublicationAction function
  it("Should process publication action", async function () {
    // Initialize the publication action
    await recipeOpenAction.initializePublicationAction(
      PROFILE_ID,
      PUBLICATION_ID,
      ownerAddress,
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "uint256", "string"],
        [recipientAddress, cookBookContract.address, 1, recipeMetadata],
      ),
    );

    // Deploy a new mock ERC20 token contract
    const TestToken = await ethers.getContractFactory("TestToken");
    const token = await TestToken.deploy();
    await token.deployed();

    const tipAmount = ethers.utils.parseEther(TIP_AMOUNT);

    // Approve the RecipeActionModule.sol contract to spend tokens
    await token.approve(recipeOpenAction.address, tipAmount);

    // Register the token in the mock ModuleRegistry contract
    await moduleRegistry.registerErc20Currency(token.address);

    // Prepare the parameters for processPublicationAction
    const params = {
      publicationActedProfileId: PROFILE_ID,
      publicationActedId: PUBLICATION_ID,
      actorProfileId: PROFILE_ID,
      actorProfileOwner: ownerAddress,
      transactionExecutor: ownerAddress,
      referrerProfileIds: [],
      referrerPubIds: [],
      referrerPubTypes: [],
      actionModuleData: ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "address", "uint256"],
        [token.address, tipAmount, cookBookContract.address, 2],
      ),
    };

    // Call the processPublicationAction function
    const tx = await recipeOpenAction.processPublicationAction(params);

    await expect(tx)
      .to.emit(recipeOpenAction, "TipCreated")
      .withArgs(ownerAddress, recipientAddress, token.address, tipAmount);

    // Get the balance of the tip receiver
    const balance = await token.balanceOf(recipientAddress);

    // Test if the tip was correctly transferred
    expect(balance).to.equal(tipAmount);
  });
});
