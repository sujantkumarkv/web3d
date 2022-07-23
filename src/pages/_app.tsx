import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "@/theme/.";
import { Web3Provider } from "src/context/web3";
import Head from "next/head";
import { initialize } from "zokrates-js";

async function MyApp({ Component, pageProps }: AppProps) {
  initialize().then((zokratesProvider) => {
    const source = `
          def main(private field[3] inner_edge_lengths, field[3] outer_edge_lengths) {
          assert(inner_edge_lengths[0] < outer_edge_lengths[0]);
          assert(inner_edge_lengths[1] < outer_edge_lengths[1]);
          assert(inner_edge_lengths[2] < outer_edge_lengths[2]);
          return;
        }`;

    const artifacts = zokratesProvider.compile(source);

    // computation
    const { witness, output } = zokratesProvider.computeWitness(artifacts, [
      ["10", "10", "10"],
      ["100", "100", "100"],
    ]);

    // run setup
    const keypair = zokratesProvider.setup(artifacts.program);

    // generate proof
    const proof = zokratesProvider.generateProof(
      artifacts.program,
      witness,
      keypair.pk
    );

    // export solidity verifier
    const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk);

    // or verify off-chain
    const isVerified = zokratesProvider.verify(keypair.vk, proof);

    console.log("verirfied", isVerified);
  });

  return (
    <>
      <Head>
        <title>Web3D</title>
      </Head>
      <ChakraProvider theme={theme}>
        <Web3Provider>
          <Component {...pageProps} />
        </Web3Provider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
