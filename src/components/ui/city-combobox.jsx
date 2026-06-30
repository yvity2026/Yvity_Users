"use client";

import { useEffect, useRef, useState } from "react";
import { Building2 } from "lucide-react";

// Major cities / towns per state and UT
const CITIES_BY_STATE = {
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool",
    "Kakinada", "Rajahmundry", "Tirupati", "Kadapa", "Anantapur",
    "Srikakulam", "Vizianagaram", "Eluru", "Ongole", "Machilipatnam",
    "Chittoor", "Nandyal", "Bhimavaram", "Narasaraopet", "Tenali",
  ],
  "Arunachal Pradesh": [
    "Itanagar", "Naharlagun", "Pasighat", "Ziro", "Bomdila",
    "Along", "Tezu", "Roing", "Khonsa", "Namsai",
  ],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon",
    "Tinsukia", "Tezpur", "Lakhimpur", "Dhubri", "Diphu",
    "Goalpara", "Barpeta", "Sivasagar", "Karimganj", "Haflong",
  ],
  "Bihar": [
    "Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga",
    "Purnia", "Arrah", "Begusarai", "Katihar", "Munger",
    "Chapra", "Samastipur", "Hajipur", "Bihar Sharif", "Sasaram",
    "Motihari", "Nawada", "Buxar", "Aurangabad", "Sitamarhi",
  ],
  "Chhattisgarh": [
    "Raipur", "Bhilai", "Durg", "Bilaspur", "Korba",
    "Rajnandgaon", "Raigarh", "Jagdalpur", "Ambikapur", "Dhamtari",
    "Mahasamund", "Kawardha", "Kondagaon", "Bemetara",
  ],
  "Goa": [
    "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda",
    "Bicholim", "Curchorem", "Sanquelim", "Canacona", "Calangute",
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
    "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Navsari",
    "Morbi", "Nadiad", "Surendranagar", "Bharuch", "Mehsana",
    "Porbandar", "Amreli", "Vapi", "Gandhidham", "Botad",
  ],
  "Haryana": [
    "Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar",
    "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula",
    "Bhiwani", "Sirsa", "Bahadurgarh", "Jind", "Thanesar",
    "Kaithal", "Rewari", "Palwal", "Fatehabad", "Nuh",
  ],
  "Himachal Pradesh": [
    "Shimla", "Solan", "Dharamshala", "Mandi", "Kullu",
    "Palampur", "Baddi", "Nahan", "Paonta Sahib", "Una",
    "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Manali",
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar",
    "Phusro", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar",
    "Chirkunda", "Chas", "Dumka", "Chaibasa", "Pakur",
  ],
  "Karnataka": [
    "Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi",
    "Kalaburagi", "Davangere", "Ballari", "Tumakuru", "Bidar",
    "Raichur", "Shivamogga", "Udupi", "Vijayapura", "Hassan",
    "Mandya", "Chitradurga", "Hospet", "Gadag", "Bagalkot",
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam",
    "Kannur", "Kottayam", "Alappuzha", "Palakkad", "Malappuram",
    "Kasaragod", "Pathanamthitta", "Ernakulam", "Wayanad", "Idukki",
    "Aluva", "Thalassery", "Tiruvalla", "Ottappalam",
  ],
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain",
    "Sagar", "Dewas", "Satna", "Ratlam", "Rewa",
    "Murwara", "Singrauli", "Burhanpur", "Khandwa", "Bhind",
    "Chhindwara", "Guna", "Shivpuri", "Vidisha", "Damoh",
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Thane", "Nashik",
    "Aurangabad", "Solapur", "Bhiwandi", "Amravati", "Nanded",
    "Kolhapur", "Sangli", "Malegaon", "Jalgaon", "Akola",
    "Latur", "Dhule", "Ahmednagar", "Chandrapur", "Parbhani",
    "Navi Mumbai", "Panvel", "Ichalkaranji", "Jalna", "Gondia",
  ],
  "Manipur": [
    "Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Senapati",
    "Ukhrul", "Tamenglong", "Jiribam", "Moreh", "Kakching",
  ],
  "Meghalaya": [
    "Shillong", "Tura", "Jowai", "Nongpoh", "Baghmara",
    "Williamnagar", "Mairang", "Resubelpara", "Nongstoin",
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib",
    "Lawngtlai", "Mamit", "Saiha", "Hnahthial",
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha",
    "Zunheboto", "Mon", "Phek", "Longleng", "Peren",
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur",
    "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda",
    "Jeypore", "Bargarh", "Balangir", "Kendujhar", "Paradip",
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda",
    "Pathankot", "Hoshiarpur", "Batala", "Moga", "Firozpur",
    "Kapurthala", "Sangrur", "Barnala", "Rajpura", "Mohali",
    "Phagwara", "Muktsar", "Fatehgarh Sahib",
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Kota", "Ajmer", "Bikaner",
    "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sri Ganganagar",
    "Sikar", "Pali", "Tonk", "Hanumangarh", "Kishangarh",
    "Beawar", "Dhaulpur", "Gangapur City", "Churu", "Jhunjhunu",
  ],
  "Sikkim": [
    "Gangtok", "Namchi", "Mangan", "Gyalshing", "Jorethang",
    "Ravangla", "Singtam", "Rangpo",
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukudi",
    "Dindigul", "Thanjavur", "Ranipet", "Sivakasi", "Karur",
    "Ooty", "Hosur", "Nagercoil", "Kumbakonam", "Kanchipuram",
    "Ambattur", "Tambaram", "Avadi", "Tiruvannamalai", "Cuddalore",
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam",
    "Ramagundam", "Mancherial", "Nalgonda", "Adilabad", "Suryapet",
    "Miryalaguda", "Jagtial", "Siddipet", "Bodhan", "Kothagudem",
    "Bhongir", "Mahbubnagar", "Sangareddy", "Wanaparthy", "Medak",
    "Secunderabad", "Zahirabad", "Nirmal", "Vikarabad",
  ],
  "Tripura": [
    "Agartala", "Dharmanagar", "Udaipur", "Kailashahar", "Belonia",
    "Khowai", "Ambassa", "Bishalgarh", "Sonamura",
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut",
    "Prayagraj", "Bareilly", "Aligarh", "Moradabad", "Saharanpur",
    "Gorakhpur", "Firozabad", "Ghaziabad", "Noida", "Mathura",
    "Jhansi", "Muzaffarnagar", "Ayodhya", "Rampur", "Amroha",
    "Hapur", "Bahraich", "Lakhimpur", "Sitapur", "Unnao",
    "Hardoi", "Bulandshahr", "Shahjahanpur", "Etawah", "Mainpuri",
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur",
    "Rishikesh", "Kashipur", "Kotdwar", "Ramnagar", "Nainital",
    "Pithoragarh", "Mussoorie", "Almora", "Srinagar", "Uttarkashi",
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri",
    "Burdwan", "Malda", "Haldia", "Kharagpur", "Raiganj",
    "Balurghat", "Purulia", "Bankura", "Jalpaiguri", "Krishnanagar",
    "Cooch Behar", "Kalyani", "Barasat", "Darjeeling", "Alipurduar",
  ],
  // Union Territories
  "Andaman and Nicobar Islands": [
    "Port Blair", "Diglipur", "Car Nicobar", "Mayabunder", "Rangat",
  ],
  "Chandigarh": [
    "Chandigarh", "Mani Majra", "Panchkula",
  ],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Daman", "Diu", "Silvassa", "Naroli", "Vapi",
  ],
  "Delhi": [
    "New Delhi", "Dwarka", "Rohini", "Laxmi Nagar", "Janakpuri",
    "Saket", "Karol Bagh", "Pitampura", "Shahdara", "Mayur Vihar",
    "Vikaspuri", "Uttam Nagar", "Preet Vihar", "Rajouri Garden",
  ],
  "Jammu and Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore",
    "Kathua", "Udhampur", "Rajouri", "Poonch", "Pulwama",
  ],
  "Ladakh": [
    "Leh", "Kargil", "Diskit", "Zanskar",
  ],
  "Lakshadweep": [
    "Kavaratti", "Agatti", "Minicoy", "Andrott",
  ],
  "Puducherry": [
    "Puducherry", "Karaikal", "Mahe", "Yanam", "Oulgaret",
  ],
};

export function CityCombobox({ id, state = "", value = "", onChange, onBlur, error }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const cityList = CITIES_BY_STATE[state] || [];

  const suggestions = query.trim()
    ? cityList.filter((c) =>
        c.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : cityList;

  // Sync when form resets
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handle = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      listRef.current.children[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const select = (city) => {
    setQuery(city);
    onChange(city);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setOpen(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!open && suggestions.length > 0 && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      setActiveIndex(0);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      onBlur?.();
    }, 150);
  };

  const noStatePicked = !state;

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex overflow-hidden rounded-xl border bg-[#F8F6F1] transition focus-within:border-[#F59E0B] focus-within:ring-2 focus-within:ring-[#F59E0B]/20 ${
          error ? "border-red-300" : "border-[#E6E6E6]"
        } ${noStatePicked ? "opacity-60" : ""}`}
      >
        <span className="flex items-center pl-3 text-[#9CA3AF]">
          <Building2 size={14} />
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (!noStatePicked) setOpen(true); }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={noStatePicked ? "Select a state first…" : "Type your city or town…"}
          disabled={noStatePicked}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-haspopup="listbox"
          className="min-h-[42px] flex-1 bg-transparent px-2 py-2 text-[13px] text-[#374151] outline-none placeholder:text-[#9CA3AF] disabled:cursor-not-allowed"
        />
      </div>

      {open && !noStatePicked && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={`Cities in ${state}`}
          className="absolute left-0 right-0 z-50 mt-1 max-h-[200px] overflow-y-auto rounded-xl border border-[#E4E2DB] bg-white py-1 shadow-[0_4px_16px_rgba(10,74,74,0.12)]"
        >
          {suggestions.length === 0 ? (
            <li className="px-3 py-2.5 text-center font-poppins text-[12px] text-[#9CA3AF]">
              No match — you can still type your city name
            </li>
          ) : (
            suggestions.map((city, i) => (
              <li
                key={city}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(city);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`cursor-pointer px-3 py-2 font-poppins text-[12px] transition-colors ${
                  i === activeIndex
                    ? "bg-[#E8F4F4] font-semibold text-[#0A4A4A]"
                    : "text-[#374151] hover:bg-[#F8F6F1]"
                }`}
              >
                {city}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
