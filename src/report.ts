import html2canvas from "html2canvas";
import { copyForIOS, isIOS } from "./clipboard";
import { db } from "./database";
import { IReport } from "./types";
import jsPDF from "jspdf";

interface GenericReport {
  [key: string]: any;
}

export function setupReport(element: HTMLButtonElement) {
  const submitForm = async () => {
    const form = document.querySelectorAll("input");
    const service = document.querySelector(
      "#service-form"
    ) as HTMLSelectElement;
    const offering = document.querySelector("#offering") as HTMLInputElement;
    const firstTimer = document.querySelector("#first-timer") as HTMLInputElement;
    if (service.value === "") {
      return service.focus();
    }

    if (offering.value === "") {
      return offering.focus();
    }

    if (firstTimer.value === "") {
      return firstTimer.focus();
    }
    const report: GenericReport = {
      id: Number(service.value),
      service: service.value,
      offering: offering.value,
      main: {
        adult: 0,
        baby: 0,
      },
      overflow: {
        adult: 0,
        baby: 0,
      },
      extension: {
        adult: 0,
        baby: 0,
      },
      teens: {
        children: 0,
        adult: 0,
      },
      children: {
        children: 0,
        adult: 0,
      },
      other: {
        traffic: 0,
        info_desk: 0,
        first_timer: 0,
      },
      date: new Date().getTime(),
    };
    for (let inputElement of form) {
      if (inputElement.value === "") {
        return inputElement.focus();
      }
      let label = inputElement.getAttribute("data-id") as string;
      if (label) {
        const [key, value] = label.split("-");
        report[key][value] = Number(inputElement.value);
      }
    }
    const exist = await db.reports.get(Number(service.value));
    if (exist) {
      await db.reports.delete(Number(service.value));
    }
    const res = await db.reports.add(report as IReport);
    if (res) {
      const notify = document.querySelector("#notify") as HTMLElement;
      notify.style.display = "block";
      notify.innerText = "Service added successfully";
    }
    alert("Service has been added.");
    window.location.reload();
  };

  const getService = async () => {
    const formInput = document.querySelector(
      "#service-form"
    ) as HTMLSelectElement;
    if (formInput.value === "") {
      return formInput.focus();
    }
    const record = (await db.reports.get(
      Number(formInput.value)
    )) as GenericReport;
    const form = document.querySelectorAll("input");
    const offering = document.querySelector("#offering") as HTMLInputElement;
    // const offering = document.querySelector("#offering") as HTMLInputElement;
    for (let inputElement of form) {
      let inputAttr = inputElement.getAttribute("data-id") as string;
      if (inputAttr) {
        const [key, value] = inputAttr.split("-");
        const data = record ? record[key as keyof IReport] : "";
        inputElement.value = record ? data[value] : "0";
      }
    }
    if (!record) {
      offering.value = "0";
      return;
    }
    offering.value = record.offering;
  };
  (document.getElementById("find-service") as HTMLElement).addEventListener(
    "click",
    getService
  );
  element.addEventListener("click", submitForm);

  const clipboard = document.getElementById("copy-to-clipboard") as HTMLElement;
  // if (isIOSMobileDevice()) {
  //   clipboard.addEventListener(
  //     "pointerdown",
  //     async () => await copyToClipboard()
  //   );
  // } else {
  clipboard.addEventListener("click", async () => await copyToClipboard());
  // }
  // copyToClipboardInDetails
  const clipboardInDetails = document.getElementById(
    "copy-to-clipboard-in-details"
  ) as HTMLElement;

  clipboardInDetails.addEventListener(
    "click",
    async () => await copyToClipboardInDetails()
  );

  const downloadInDetailsBtnElem = document.getElementById(
    "download-in-details"
  ) as HTMLElement;

  const reportTitle = document.getElementById(
    "report-title"
  ) as HTMLElement;

  downloadInDetailsBtnElem.addEventListener(
    "click",
    async () => {
      const displayElem = document.getElementById("printable-board") as HTMLElement;
      displayElem.style.display = "block";
      reportTitle.innerHTML = "Today's &nbsp; Attendance &nbsp; Report &nbsp; (in detail)"
      const elem = document.getElementById("service-board") as HTMLElement;
      const printDate = document.getElementById("print-date") as HTMLElement;
      printDate.innerHTML = getAfricanDateFormat();
      const printPreview = document.getElementById("attendance-report") as HTMLElement;
      printPreview.innerHTML = elem.innerHTML;
      await download("printable-board");
      displayElem.style.display = "none";
    }
  );

  const downloadBtnElem = document.getElementById(
    "download"
  ) as HTMLElement;

  downloadBtnElem.addEventListener(
    "click",
    async () => {
      const displayElem = document.getElementById("printable-board") as HTMLElement;
      displayElem.style.display = "block";
      reportTitle.innerHTML = "Today's &nbsp; Attendance &nbsp; Report &nbsp; (summary)"
      const reportSummary = document.getElementById("summary-data") as HTMLElement;
      const printDate = document.getElementById("print-date") as HTMLElement;
      printDate.innerHTML = getAfricanDateFormat();
      const printPreview = document.getElementById("attendance-report") as HTMLElement;
      printPreview.innerHTML = reportSummary.innerHTML;
      await download("printable-board")
      displayElem.style.display = "none";
    }
  );

  const navigation = document.getElementById("btn-navigation") as HTMLElement;
  navigation.addEventListener("click", async (event) => {
    const elemTarget = event.target as HTMLElement;
    const elem = document.getElementById("form-layout") as HTMLElement;
    const prev = document.getElementById("preview-layout") as HTMLElement;
    if (elem.style.display === "block") {
      elem.style.display = "none";
      prev.style.display = "block";
      elemTarget.innerText = "Home";
    } else {
      elem.style.display = "block";
      elemTarget.innerText = "Preview";
      prev.style.display = "none";
    }
  });

  const date = new Date();
  const formattedDate = formatDate(date);
  const currentDate = document.getElementById("date") as HTMLElement;
  currentDate.innerText = formattedDate;

  const collapsibles = document.querySelectorAll(
    ".collapse-summary"
  ) as NodeListOf<Element>;

  for (let collapsible of collapsibles) {
    collapsible.addEventListener("click", (event) => {
      const evt = event.target as HTMLElement;
      const elem = evt.nextElementSibling as any;
      if (elem.classList.contains("collapse-summary-show")) {
        elem.classList.remove("collapse-summary-show");
        elem.classList.add("collapse-summary-hide");
      } else {
        elem.classList.add("collapse-summary-show");
        elem.classList.remove("collapse-summary-hide");
      }
    });
  }
  fetchAllRecordOnDisplay();
  fetchRecordForInDetails();
}

function getMoneyFormat(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2, // Minimum number of decimal places
  })
    .format(amount)
    .replace("NGN", "&#8358;");
}

async function fetchRecordForInDetails() {
  let records = await getRecords();
  let result = "";
  if (records.length === 0) {
    result = "<p style='text-align:center'>No report available!</p>";
  }
  for (let record of records) {
    const totalAdult = await getTotalAdult(record);
    const totalChildrenAndBaby = await getTotalChildrenAndBaby(record);
    const total = await getTotalAttendance(record);
    const services = getService(Number(record?.service));
    let elem = `
  <div>
  <div class="collapse">
    <h5>${services} &nbsp;service</h5>
  </div>
  <div class="block">
    <p class="title">Adult</p>
    <p>Main: ${record?.main.adult}</p>
    <p>Extension: ${record?.extension.adult}</p>
    <p>Overflow: ${record?.overflow.adult}</p>
    <p>Traffic: ${record?.other.traffic}</p>
    <p>Info desk: ${record?.other.info_desk}</p>
    <p>Teen teacher: ${record?.teens.adult}</p>
    <p>Children teacher: ${record?.children.adult}</p>
    <p><strong>Total: ${totalAdult}</strong></p>
  </div>
  <div class="block">
    <p class="title">Children & Baby</p>
    <p>Main(Baby): ${record?.main.baby}</p>
    <p>Extension(Baby): ${record?.extension.baby}</p>
    <p>Overflow(Baby): ${record?.overflow.baby}</p>
    <p>Chidren: ${record?.children.children}</p>
    <p><strong>Total: ${totalChildrenAndBaby}</strong></p>
  </div>
  <div class="block">
    <p class="title">Teen: ${record?.teens.children}</p>
  </div>
  <div class="block">
  <p class="title">First Timer: ${record?.other.first_timer || 0}</p>
  <p class="title">Total Attendance: ${total}</p>
</div>
  <div class="block">
    <p class="title">Offering: ${getMoneyFormat(Number(record?.offering))}</p>
  </div>
  </div>
  <p></p>
<div>
  `;
    result += elem;
  }
  const display = document.querySelector("#service-board") as HTMLElement;
  display.innerHTML = result;
}

async function getRecords() {
  let records = await db.reports.bulkGet([1, 2]);
  return records.filter((record) => record !== undefined);
}

let grandTotalAttendance = 0;
async function fetchAllRecordOnDisplay() {
  let records = await getRecords();
  let result = "";
  if (records.length === 0) {
    result = "<p style='text-align:center'>No report available!</p>";
  }
  let totalFirstTimer = 0;
  for (let record of records) {
    const totalAdult = await getTotalAdult(record);
    const totalBaby = await getTotalChildrenAndBaby(record);
    const total = await getTotalAttendance(record);
    const service = getService(Number(record?.service));
    totalFirstTimer += record?.other.first_timer || 0
    grandTotalAttendance += total;
    const elem = `
    <div class="block">
    <div class="collapse">
      <h5>${service}-Service</h5>
    </div>
      <p>Total Adult: ${totalAdult}</p>
      <p>Total Children & Baby: ${totalBaby}</p>
      <p>Teens: ${record?.teens?.children}</p>
      <p>Offering: ${getMoneyFormat(Number(record?.offering))}</p>
      <p>Total First timer: ${record?.other.first_timer || 0}</p>
      <p><strong>Total Attendance: ${total}</strong></p>
    </div>
    `;
    result += elem;
  }
  const display = document.querySelector("#summary") as HTMLElement;
  const totalFirstTimerRecorded = document.querySelector(
    "#total-first-timer"
  ) as HTMLElement;
  totalFirstTimerRecorded.innerText = String(totalFirstTimer)
  const totalAttendance = document.querySelector(
    "#total-attendance"
  ) as HTMLElement;
  totalAttendance.innerText = String(grandTotalAttendance);
  const totalAttendanceElem = totalAttendance.parentElement as HTMLElement;
  if (records.length > 0) {
    totalAttendanceElem.classList.remove("collapse-summary-hide");
    const firstTimerElem = totalFirstTimerRecorded.parentElement as HTMLElement;
    firstTimerElem.classList.remove("collapse-summary-hide");
  }
  display.innerHTML = result;
}

async function getTotalAdult(record: IReport | undefined) {
  let result = Number(record?.main.adult) + Number(record?.extension.adult);
  result += Number(record?.overflow.adult) + Number(record?.other.traffic);
  result += Number(record?.other.info_desk) + Number(record?.children.adult);
  result += Number(record?.teens.adult);
  return result;
}

async function getTotalChildrenAndBaby(record: IReport | undefined) {
  let result = Number(record?.main.baby) + Number(record?.extension.baby);
  result += Number(record?.overflow.baby) + Number(record?.children.children);
  return result;
}

async function getTotalAttendance(record: IReport | undefined) {
  return (
    (await getTotalChildrenAndBaby(record)) +
    (await getTotalAdult(record)) +
    Number(record?.teens.children)
  );
}

function getAfricanDateFormat() {
  const date = new Date();
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}
function formatDate(date: Date) {
  const options = { day: "2-digit", month: "long", year: "numeric" } as any;
  return date.toLocaleDateString("en-US", options);
}

function getService(service: number): string {
  const services = ["First", "Second"];
  return services[service - 1];
}

async function copyToClipboard() {
  let records = (await db.reports.bulkGet([1, 2])) as IReport[];
  records = records.filter((record) => record !== undefined);
  const date = new Date();
  const formattedDate = formatDate(date);
  let output = "";
  if (records.length === 0) {
    return alert("Unable to Copy: No Report Found");
  }
  output =
    "Attendance Stats for Abule-Egba Centre \n ----------------------------------\n";
  output += `*Date: ${formattedDate}*`;
  let totalCalculatedFirstTimer = 0;
  for (let record of records) {
    const totalAdult = await getTotalAdult(record);
    const totalBaby = await getTotalChildrenAndBaby(record);
    const total = await getTotalAttendance(record);
    // grandTotalAttendance += total;
    const service = getService(Number(record?.service));
    totalCalculatedFirstTimer += Number(record.other.first_timer || 0);
    const elem = `
Service: 1st & 2nd Services
${service} Service
Total Children & babies: ${totalBaby}
Number of Adults: ${totalAdult}
Total Teens: ${record?.teens.children}
First timer: ${record?.other.first_timer || 0}
Offering: ${getMoneyFormat(Number(record?.offering)).replace("&#8358;", "₦")}
Total attendance = ${total}
----------------------------------
  `;
    output += elem;
  }
  output += `
Total First timer: ${totalCalculatedFirstTimer}
Grand Total for the ${records.length} services; \n
*Grand Total = ${grandTotalAttendance}*
  `;
  return copyText(output);
}

async function copyToClipboardInDetails() {
  let records = (await db.reports.bulkGet([1, 2])) as IReport[];
  records = records.filter((record) => record !== undefined);
  const date = new Date();
  const formattedDate = formatDate(date);
  let output = "";
  if (records.length === 0) {
    return alert("Unable to Copy: No Report Found");
  }
  output = "Attendance Stats Analysis \n ------------------------------\n";
  output += `*Date: ${formattedDate}*`;
  for (let record of records) {
    const totalAdult = await getTotalAdult(record);
    const totalBaby = await getTotalChildrenAndBaby(record);
    const total = await getTotalAttendance(record);
    const service = getService(Number(record?.service));
    const elem = `
Service: 1st & 2nd Services
${service} Service
*Adult*\n
Main: ${record?.main.adult}
Extension: ${record?.extension.adult}
Overflow/Cinema: ${record?.overflow.adult}
Traffic: ${record?.other.traffic}
Info desk: ${record?.other.info_desk}
Teen teacher: ${record?.teens.adult}
Children teacher: ${record?.children.adult}
*Total: ${totalAdult}*
------------------------------
*Baby & Children*
Main(Baby): ${record?.main.baby}
Extension(Baby): ${record?.extension.baby}
Overflow/Cinema(Baby): ${record?.overflow.baby}
Chidren: ${record?.children.children}
*Total: ${totalBaby}*
------------------------------
*Teens:* ${record?.teens.children}
------------------------------
*First Timer: ${record?.other.first_timer || 0}*
------------------------------
*Total Attendance: ${total}*
------------------------------
*Offering: ${getMoneyFormat(Number(record?.offering)).replace("&#8358;", "₦")}*
  `;
    output += elem;
  }
  return copyText(output);
  // await navigator.clipboard.writeText(output);
  // return alert("Copied to clipboard.");
}

const download = async (reportElementId: string) => {
  html2canvas(document.getElementById(reportElementId) as HTMLElement, {
    allowTaint: true,
    scale: 4,
  }).then((canvas) => {
    let HTMLWidth = canvas.width;
    let HTMLHeight = canvas.height;
    let topLeftMargin = 16;
    let PDFWidth = HTMLWidth + topLeftMargin * 2;
    let PDFHeight = PDFWidth * 1.5 + topLeftMargin * 2;
    let canvasImageWidth = HTMLWidth;
    let canvasImageHeight = HTMLHeight;
    let totalPDFPages = Math.ceil(HTMLHeight / PDFHeight) - 1;
    canvas.getContext("2d");
    let imgData = canvas.toDataURL("image/png", 1.0);
    let pdf = new jsPDF("p", "pt", [PDFWidth, PDFHeight]);
    pdf.addImage(
      imgData,
      "PNG",
      topLeftMargin,
      topLeftMargin,
      canvasImageWidth,
      canvasImageHeight
    );
    for (let i = 1; i <= totalPDFPages; i++) {
      pdf.addPage([PDFWidth, PDFHeight], "p");
      pdf.addImage(
        imgData,
        "PNG",
        topLeftMargin,
        -(PDFHeight * i) + topLeftMargin * 4,
        canvasImageWidth,
        canvasImageHeight
      );
    }
    const dateFormater = getAfricanDateFormat();
    pdf.save(`${dateFormater}-report.pdf`);
  });
};

async function copyText(output: string) {
  try {
    if (isIOS()) {
      copyForIOS(output);
      return alert("Copied to clipboard, IOS.");
    }
    await navigator.clipboard.writeText(output);
    alert("Copied to clipboard.");
  } catch (err: any) {
    alert("Clipboard write permission not granted");
  }
}

// function isIOSMobileDevice() {
//   return /Mobi/i.test(navigator.userAgent);
// }

// function copyToClipboardForMobile(data: string) {
//   // Create a text area to temporarily hold the text to copy
//   var textArea = document.createElement("textarea");
//   textArea.value = data;
//   // Append the text area to the document
//   document.body.appendChild(textArea);
//   // Select the text in the text area
//   textArea.select();
//   try {
//     // Copy the selected text to the clipboard
//     document.execCommand("copy");
//     alert("Report has been copied to clipboard!");
//   } catch (err) {
//     console.error("Unable to copy to clipboard", err);
//   }
//   // Remove the temporary text area
//   document.body.removeChild(textArea);
// }
