import Head from 'next/head';
import { FireDreamContainer } from '../components';
import styles from '../styles/Home.module.css'
import { firestore } from '../util/firebase-client';
import { collection, QueryDocumentSnapshot, DocumentData, query, where, getDocs } from "@firebase/firestore";
import { useEffect, useState } from 'react';
import { Config, Expense, Wallet } from '../types';
import { getServerSidePropsWithAuth, ServerProps } from '../util/get-server-side-props-with-auth';
import WalletList from '../components/wallet-list';
import { bulkCreate, deleteFromDB, getExpensesByPeriod, getUpdateQuotesUrl, saveOnDB, updateWalletsQuotes } from '../util/services';
import { useRouter } from 'next/router';
import { doc, getDoc, orderBy } from 'firebase/firestore';
import Swal from 'sweetalert2';
import axios from 'axios';
import ExpenseList, { DateFilter } from '../components/expense-list';
import moment from 'moment';

const ExpenseCollection = collection(firestore, 'expenses');

export const getServerSideProps = getServerSidePropsWithAuth;

const Home = (props: ServerProps) => {
  const router = useRouter();
  const configRef = doc(firestore, 'config/' + props.authUserId);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [config, setConfig] = useState<Config>();
  const defaultDateFilter = {start:moment().subtract(1, 'month').format('YYYY-MM-DD'), end:moment().format('YYYY-MM-DD')};
  const [dateFilter, setDateFilter] = useState<DateFilter>(defaultDateFilter);

  const getConfig = async () => {
    const result = await getDoc(configRef);
    const c = result.data() as Config;
    setConfig(c);
  };

  const getExpenses = async (fltr: DateFilter) => {
    let start = fltr.start;
    let end = fltr.end;
    const exp = await getExpensesByPeriod(props.authUserId, start, end);
    setExpenses(exp);
  }

  const saveExpense = async (expense: Expense) => {
    console.log('save expense', expense);
    try {
      await saveOnDB('expenses', expense);
      Swal.fire(
        'Good job!',
        'Expense saved successfully!',
        'success'
      );
      await getExpenses(dateFilter);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  const bulkSaveExpenses = async (expenses: Expense[]) => {
    console.log('bulk create expenses', expenses);
    try {
      await bulkCreate<Expense>('expenses', expenses);
      Swal.fire(
        'Good job!',
        'Expenses bulk created successfully!',
        'success'
      );
      await getExpenses(dateFilter);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  const deleteExpense = async (expense: Expense) => {
    console.log('delete expense', expense);
    try {
      if (!expense.id) {
        throw Error('Missing id!');
      }
      await deleteFromDB('expenses', expense.id);
      Swal.fire(
        'Good job!',
        'Expense saved successfully!',
        'success'
      );
      await getExpenses(dateFilter);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  useEffect(() => {
    // get the todos
    getConfig();
    getExpenses(dateFilter);
    // reset loading
    // setTimeout(() => {
    //   setLoading(false);
    // }, 2000)
  }, [dateFilter]);

  return (
    <>
      <Head>
        <title>{process.env.APP_NAME}</title>
        <meta name="description" content="{process.env.APP_NAME}" />
        <link rel="icon" href="/firedream-logo.svg" />
      </Head>
      <FireDreamContainer>
        <ExpenseList expenses={expenses} onSubmit={saveExpense} onBulkCreate={bulkSaveExpenses} onDelete={deleteExpense} onChangeDateFilter={setDateFilter} dateFilter={dateFilter} owner={props.authUserId} />
      </FireDreamContainer>
      <footer className={styles.footer}>
        <a
          href="#"
          rel="noopener noreferrer"
        >
        </a>
      </footer>
    </>
  )
}
export default Home