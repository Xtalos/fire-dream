import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import nookies from 'nookies';
import { getAuth } from './firebase-admin';


export const getServerSidePropsWithAuth = async (ctx: GetServerSidePropsContext) => {
    try {
      const cookies = nookies.get(ctx);
      //console.log(JSON.stringify(cookies, null, 2));
      const token = await getAuth().verifyIdToken(cookies.token);
      const { uid, email } = token;
  
      // the user is authenticated!
      // FETCH STUFF HERE
  
      return {
        props: { 
          message: `Your email is ${email} and your UID is ${uid}.`,
          authUserId: uid
       },
      };
    } catch (err) {
      // either the `token` cookie didn't exist
      // or token verification failed
      // either way: redirect to the login page
      // either the `token` cookie didn't exist
      // or token verification failed
      // either way: redirect to the login page
      return {
        redirect: {
          permanent: false,
          destination: "/login",
        },
        // `as never` is required for correct type inference
        // by InferGetServerSidePropsType below
        props: {} as never,
      };
    }
  };

  export type ServerProps = InferGetServerSidePropsType<typeof getServerSidePropsWithAuth>;