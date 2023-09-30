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

const firebaseConfigTiddler = "$:/FirebaseConfig";
const location =
	typeof window !== "undefined" ? window.location.href : "build-time";
const firebaseConfigStorage = `${firebaseConfigTiddler}|${location}}`;
// Your web app's Firebase configuration
let firebaseConfig = undefined;

if (typeof window !== "undefined") {
	const configString = window.localStorage.getItem(firebaseConfigStorage);
	console.log(`FIREBASE: ${configString}`);
	firebaseConfig = JSON.parse(configString);
}

const app = firebaseConfig ? initializeApp(firebaseConfig) : undefined;
const firestore = app
	? initializeFirestore(app, {
			experimentalForceLongPolling: false, // isSafari(),
	  })
	: undefined;

let initialLoadDone = false;
export function initialLoadComplete() {
	return initialLoadDone;
}
export function isConfiguration(id: string) {
	return id === firebaseConfigTiddler;
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
	if (firestore) {
		const tiddlers = collection(firestore, "tiddlers");
		const unsub = onSnapshot(
			query(tiddlers),
			(querySnapshot) => {
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
					console.log(
						`Tiddler update mods=${JSON.stringify(
							modifications,
						)} dels=${JSON.stringify(deletions)}`,
					);
					callback(null, { modifications, deletions });
				}
				initialLoadDone = true;
			},
			(err) => {
				console.error(err);
				alert(err);
			},
		);
	}
}
export function storeTiddler(id: string, tiddlerData: any) {
	if (id === firebaseConfigTiddler) {
		window.localStorage.setItem(firebaseConfigStorage, tiddlerData.text);
		window.location.reload();
	}
	if (id && firestore) {
		const store = doc(firestore, `tiddlers/${makeId(id)}`);
		return setDoc(store, tiddlerData);
	}
}

export async function loadTiddler(
	id: string,
	callback: (arg0: null, arg1: DocumentData) => void,
) {
	if (id && firestore) {
		const store = doc(firestore, `tiddlers/${makeId(id)}`);
		const tiddler = await getDoc(store);
		callback(null, tiddler.data());
	}
}

export function deleteTiddler(id: string) {
	if (id && firestore) {
		const store = doc(firestore, `tiddlers/${makeId(id)}`);
		return deleteDoc(store);
	}
}
