import Head from 'next/head';
import { FireDreamContainer } from '../components';
import styles from '../styles/Home.module.css'
import { firestore } from '../util/firebase-client';
import { useEffect, useState } from 'react';
import { Config, Expense } from '../types';
import { getServerSidePropsWithAuth, ServerProps } from '../util/get-server-side-props-with-auth';
import { bulkCreate, deleteFromDB, getExpensesByPeriod, saveOnDB } from '../util/services';
import { doc, getDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import ExpenseList, { DateFilter, ParamFilter } from '../components/expense-list';
import moment from 'moment';
import { changeEmptyToMisc, getSubCategoryLabel } from '../util/helpers';

export const getServerSideProps = getServerSidePropsWithAuth;

const Home = (props: ServerProps) => {
  const configRef = doc(firestore, 'config/' + props.authUserId);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cachedExpenses, setCachedExpenses] = useState<Expense[]>([]);
  const [config, setConfig] = useState<Config>();
  const defaultDateFilter = {start:moment().subtract(1, 'month').format('YYYY-MM-DD'), end:moment().add(1,'day').format('YYYY-MM-DD')};
  const [dateFilter, setDateFilter] = useState<DateFilter>(defaultDateFilter);

  const getConfig = async () => {
    const result = await getDoc(configRef);
    const c = result.data() as Config;
    setConfig(c);
  };

  const getExpenses = async (fltr: DateFilter, forceGetFromDB:boolean = false) => {
    let oneYearAgo = moment().subtract(1, 'year');
    const getFromDB = forceGetFromDB || cachedExpenses.length == 0 || moment(fltr.start).isBefore(oneYearAgo);
    let start = moment(fltr.start).isBefore(oneYearAgo) ? fltr.start : oneYearAgo.format('YYYY-MM-DD');
    let end = fltr.end;
    let exp = getFromDB ? await getExpensesByPeriod(props.authUserId, start, end) : cachedExpenses;
    exp = exp.map(e => ({...e,category:changeEmptyToMisc(e.category),subcategory:changeEmptyToMisc(e.subcategory)}));
    if (getFromDB)  {
      setCachedExpenses(exp);
    }
    setExpenses(exp);
  }

  const filterExpenses = async (fltr: ParamFilter) => {
    const expFiltered = cachedExpenses.filter(e => 
      (fltr.account.length == 0 || fltr.account.includes(e.account)) &&
      (fltr.category.length == 0 || fltr.category.includes(e.category)) &&
      (fltr.subcategory.length == 0 || fltr.subcategory.includes(getSubCategoryLabel(e)))
      );
    setExpenses(expFiltered);

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
      await getExpenses(dateFilter, true);
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
      await getExpenses(dateFilter, true);
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
      await getExpenses(dateFilter, true);
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
        <ExpenseList expenses={expenses} 
          cachedExpenses={cachedExpenses}
          onSubmit={saveExpense} 
          onBulkCreate={bulkSaveExpenses} 
          onDelete={deleteExpense} 
          onChangeDateFilter={setDateFilter} 
          filterExpenses={filterExpenses}
          dateFilter={dateFilter} 
          owner={props.authUserId}
          config={config} />
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