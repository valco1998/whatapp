import { useEffect, useState } from "react"; // מייבא את useEffect ו-useState מ-React
import toast from "react-hot-toast"; // מייבא את toast מספריית react-hot-toast להצגת הודעות טוסטר (הודעות קטנות שנעלמות לבד)

const useGetConversations = () => {
    // יוצר hook מותאם אישית בשם useGetConversations

	const [loading, setLoading] = useState(false); // מגדיר מצב 'loading' כדי לעקוב האם המידע בטעינה. ערך התחלתי: false
	const [conversations, setConversations] = useState([]); // מגדיר מצב 'conversations' כדי לאחסן את רשימת השיחות. ערך התחלתי: מערך ריק

	useEffect(() => {

		const getConversations = async () => {
			setLoading(true);

			try {
				const res = await fetch("/api/users"); 
				const data = await res.json(); 

				if (data.error) {
					
					throw new Error(data.error); 
				}

				setConversations(data); 
			} catch (error) {
				toast.error(error.message); 
			} finally {
				setLoading(false);
			}
		};

		getConversations(); 
	}, []); 

	return { loading, conversations }; 
};

export default useGetConversations; 
