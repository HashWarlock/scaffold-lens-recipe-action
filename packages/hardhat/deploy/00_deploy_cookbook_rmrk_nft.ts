import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber } from "ethers";

const deployCookBook: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const args = ["ipfs://QmSU2R1ewXA7vmxD17KQTLRG1nu63KPxDmnb6xdtZ2Hmq5", BigNumber.from(100), deployer, 500];

  await deploy("CookBook", {
    from: deployer,
    args: args,
    log: true,
    autoMine: true,
  });

  const cookBook = await hre.ethers.getContract("CookBook", deployer);
  console.log(`CookBook deployed to ${cookBook.address}.`);
};

export default deployCookBook;

deployCookBook.tags = ["CookBook"];
