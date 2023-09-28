// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	increment,
	initializeFirestore,
	onSnapshot,
	orderBy,
	query,
	setDoc,
	getDoc,
	where,
	DocumentData,
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyAAU8G6_I93RuQsfFdOf5wwdU4Wpn3cTXk",
	authDomain: "tiddlywiki-a94cd.firebaseapp.com",
	projectId: "tiddlywiki-a94cd",
	storageBucket: "tiddlywiki-a94cd.appspot.com",
	messagingSenderId: "251419323197",
	appId: "1:251419323197:web:0e0ee30112d98099857354",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = initializeFirestore(app, {
	experimentalForceLongPolling: false, // isSafari(),
});

let initialLoadDone = false;
export function initialLoadComplete() {
	return initialLoadDone;
}

function makeId(id: string) {
	return id.replaceAll("/", "∕");
}
export function registerSyncCallback(
	callback: (
		arg0: null,
		arg1: { modifications: string[]; deletions: string[] },
	) => void,
) {
	const tiddlers = collection(firestore, "tiddlers");
	const unsub = onSnapshot(query(tiddlers), (querySnapshot) => {
		const changed = querySnapshot.docChanges();
		const modifications: string[] = [];
		const deletions: string[] = [];
		changed.forEach((docchange) => {
			const title = docchange.doc.data().title;
			if (docchange.type === "removed") {
				deletions.push(title);
			} else {
				modifications.push(title);
			}
		});
		if (modifications.length > 0 || deletions.length > 0) {
			console.log(`Tiddler update mods=${JSON.stringify(modifications)} dels=${JSON.stringify(deletions)}`)
			callback(null, { modifications, deletions });
		}
		initialLoadDone = true;
	});
}
export function storeTiddler(id: string, tiddlerData: any) {
	if (id) {
		const store = doc(firestore, `tiddlers/${makeId(id)}`);
		return setDoc(store, tiddlerData);
	}
}

export async function loadTiddler(id: string, callback: (arg0: null, arg1: DocumentData) => void) {
	if (id) {
		const store = doc(firestore, `tiddlers/${makeId(id)}`);
		const tiddler = await getDoc(store);
		callback(null, tiddler.data());
	}
}


export function deleteTiddler(id: string) {
	if (id) {
		const store = doc(firestore, `tiddlers/${makeId(id)}`);
		return deleteDoc(store);
	}
}
