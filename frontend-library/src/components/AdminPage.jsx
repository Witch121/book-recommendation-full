import React, { useEffect, useState } from 'react';
import { collection, getDocs} from 'firebase/firestore';
import { db } from '../components/firebaseFolder/firebase';

const AdminPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
      usersToday: 0,
      usersThisWeek: 0,
      booksToday: 0,
      booksThisWeek: 0,
    });
  
    useEffect(() => {
      // Fetch users and books when component mounts
      const fetchUsersAndBooks = async () => {
        setLoading(true);
  
        try {
          // Fetch users collection from Firestore
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
          // Fetch books collection from Firestore
          const booksSnapshot = await getDocs(collection(db, 'books'));
          const booksData = booksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
          // Compute statistics based on fetched data
          calculateStats(usersData, booksData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
  
        setLoading(false);
      };
  
      fetchUsersAndBooks();
    }, []);
  
    // Function to calculate statistics
    const calculateStats = (users, books) => {
      const today = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      const oneWeekAgo = new Date(today.getTime() - 7 * oneDay);
  
      let usersToday = 0;
      let usersThisWeek = 0;
      let booksToday = 0;
      let booksThisWeek = 0;
  
      users.forEach(user => {
        const createdAt = user.createdAt?.toDate() || new Date();
        if (createdAt >= oneWeekAgo) {
          usersThisWeek += 1;
          if (createdAt >= new Date(today.getTime() - oneDay)) {
            usersToday += 1;
          }
        }
      });
  
      books.forEach(book => {
        const createdAt = book.createdAt?.toDate() || new Date();
        if (createdAt >= oneWeekAgo) {
          booksThisWeek += 1;
          if (createdAt >= new Date(today.getTime() - oneDay)) {
            booksToday += 1;
          }
        }
      });
  
      setStats({ usersToday, usersThisWeek, booksToday, booksThisWeek });
    };
  
    return (
      <div className="home-container">
        <h2>Admin Statistics</h2>
  
        {loading ? (
          <p>Loading statistics...</p>
        ) : (
          <div>
            <h3>Statistics</h3>
            <p>Users today: {stats.usersToday}</p>
            <p>Users this week: {stats.usersThisWeek}</p>
            <p>Books added today: {stats.booksToday}</p>
            <p>Books added this week: {stats.booksThisWeek}</p>
          </div>
        )}
      </div>
    );
  };
  
  export default AdminPage;