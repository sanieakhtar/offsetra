import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";

const KGCO2_PER_GAS = 0.0003100393448;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const API_URL = `https://api.etherscan.io/api?module=account&action=txlist&startblock=0&endblock=99999999&sort=asc&apikey=${API_KEY}&address=`;

interface Transaction {
  from: string;
  gas: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const gasSum = (acc: number, cur: Transaction) => acc + Number(cur.gas);

const getGas = (res: Array<Transaction>) => res.reduce(gasSum, 0);

const Emissions: React.FC<{ address: string }> = ({ address }) => {
  const { data, error } = useSWR(API_URL + address, fetcher);

  if (error) return <p>Error fetching data.</p>;
  if (!data) return <p>Fetching data...</p>;
  if (data.status == 0) return <p>{data.result}</p>;

  const sent = data.result.filter(
    (cur: Transaction) => cur.from == address.toLowerCase()
  );

  const transactions = sent.length;
  const gas = getGas(sent);
  const kgco2 = Math.round(gas * KGCO2_PER_GAS);

  return (
    <>
      <p>
        {transactions} transactions were sent from <em>{address}</em>.
      </p>
      <p>These transactions consumed {gas} gas.</p>
      <p>
        This emitted the equivalent of {kgco2} kg of CO₂ into the atmosphere.
      </p>
    </>
  );
};

const Form: React.FC = () => (
  <form>
    <label>
      Please enter an ETH address:
      <input type="text" name="a"></input>
    </label>
  </form>
);

const Home: React.FC = () => {
  const router = useRouter();
  const address = router.query.a?.toString();

  return (
    <>
      <Head>
        <title>Calculate ETH Emissions | carbon.fyi</title>
      </Head>

      <main>
        {address ? <Emissions address={address} /> : <Form />}
      </main>

      <footer>
        <p>
          <a href="https://gitlab.com/de-souza/carbon.fyi/">source code</a>
        </p>
      </footer>
    </>
  );
};

export default Home;
