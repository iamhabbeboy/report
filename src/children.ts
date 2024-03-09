import { getTimestamp } from "./common";
import { db } from "./database";
import { GoogleFirestoreDatabase } from "./firebase";
import { IChildren } from "./types";

const collectionName = "tcn-children";

export function setupChildren() {
  const form = document.getElementById("capture-record") as HTMLElement;
  form.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const parentName = document.getElementById(
      "parent-name",
    ) as HTMLInputElement;
    const parentPhone = document.getElementById(
      "parent-phone",
    ) as HTMLInputElement;
    const childName = document.getElementById("child-name") as HTMLInputElement;
    const childDob = document.getElementById("child-dob") as HTMLDataElement;
    const homeAddress = document.getElementById(
      "home-address",
    ) as HTMLTextAreaElement;
    const btnSubmitted = document.getElementById(
      "btn-form-submitted",
    ) as HTMLButtonElement;
    const img = document.getElementById("preview") as HTMLImageElement;
    if (img.src === "") {
      return alert("Kindly capture an image before you proceed");
    }
    const start = new Date(childDob.value);
    const end = new Date();
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth() + 1;

    // Adjust for months if the end month is less than the start month
    if (months < 0) {
      years--;
      months += 12;
    }

    const child: IChildren = {
      age: years === 0 ? months : years,
      ageData: {
        months,
        years,
      },
      name: childName.value,
      dob: childDob.value,
      parentName: parentName.value,
      parentPhone: parentPhone.value,
      homeAddress: homeAddress.value,
      image: img.src,
      created_at: getTimestamp(),
    };
    btnSubmitted.setAttribute("disabled", "true");
    const elem = btnSubmitted.children[0] as HTMLImageElement;
    elem.style.display = "inline-block";
    // const res = await db.children.add(child as IChildren);

    try {
      const fb = new GoogleFirestoreDatabase();
      const resp = await fb.addToCollection(collectionName, child);
      if (resp) {
        parentName.value = "";
        parentPhone.value = "";
        childName.value = "";
        childDob.value = "";
        homeAddress.value = "";
        alert("Record added succesfully!");
        window.location.href = "/children/";
      }
      return Response.json({ error: "Error occured" });
    } catch (e) {
      return alert("Error occured!");
    }
  });
  getAllChildren();
}

async function getAllChildren() {
  // const getAllChildren = await db.children.where("age").above(0).toArray();
  const loader = document.getElementById("preload-record") as HTMLDivElement;
  loader.style.display = "block";
  const fb = new GoogleFirestoreDatabase();
  const getAllChildren = await fb.getCollectionLimit(collectionName);
  const childrenList = document.getElementById("children-list") as HTMLElement;
  let result = "";
  getAllChildren.forEach((child) => {
    result += `<div class="children">
        <div class="children__layout">
          <img
            src="${child.image}"
            style="border-radius: 9px;width: 150px; height: 150px"
          />
          <div class="children__name">
            <h3>${child.name}</h3>
            <h3>Age: ${child.ageData.years} Years, ${child.ageData.months} Months</h3>
            <p>Parent Name: ${child.parentName}</p>
            <p>Parent Phone No.: ${child.parentPhone}</p>
            ${child.homeAddress ? "<p>Address: " + child.homeAddress + "</p>" : ""}
          </div>
          <!--<div class="children__option">
            <button>Check-in</button>
            <button>Check-in</button>
          </div>-->
        </div>
      </div>`;
  });
  childrenList.innerHTML = result;
  loader.style.display = "none";
}
