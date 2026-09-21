import json
import datetime
from sqlalchemy.orm import Session
import models
import auth

try:
    from zoneinfo import ZoneInfo
    IST = ZoneInfo("Asia/Kolkata")
except Exception:
    IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30), name="IST")

def get_ist_now():
    return datetime.datetime.now(IST)

def seed_database(db: Session):
    """
    Seeds initial database data:
    1. Demo Users: Resident ('resident'/'resident123') and Admin ('admin'/'admin123')
    2. Actual 208 Field Survey Responses from Ramaswami Peta, Rajanagaram
    3. Demo Complaints across Ramaswami Peta landmarks
    4. Awareness educational guidelines
    5. Welcome Notifications
    """
    # 1. Seed Users if not present
    resident_user = db.query(models.User).filter(models.User.username == "resident").first()
    if not resident_user:
        resident_user = models.User(
            username="resident",
            email="resident@ramaswamipeta.local",
            password_hash=auth.hash_password("resident123"),
            full_name="K. Satyanarayana",
            phone="9848022334",
            address="Door No. 3-45, Temple Street, Ramaswami Peta, Rajanagaram",
            role="resident",
            created_at=get_ist_now() - datetime.timedelta(days=30)
        )
        db.add(resident_user)

    admin_user = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin_user:
        admin_user = models.User(
            username="admin",
            email="admin@rajanagaram.gov.local",
            password_hash=auth.hash_password("admin123"),
            full_name="Municipal Engineer Prasad Rao",
            phone="9440155667",
            address="Panchayat & Municipal Engineering Division, Rajanagaram Mandal",
            role="admin",
            created_at=get_ist_now() - datetime.timedelta(days=60)
        )
        db.add(admin_user)

    db.commit()
    db.refresh(resident_user)
    db.refresh(admin_user)

    # 2. Seed 208 Real Survey Responses if empty
    survey_count = db.query(models.SurveyResponse).count()
    if survey_count < 208:
        db.query(models.SurveyResponse).delete() # Refresh for exact fidelity
        
        # Ground truth distribution from Ramaswami Peta CSP survey:
        # Total = 208
        # Q1 Regular Water: Yes=122, No=65, Sometimes=21
        # Q2 Summer Shortage: Yes=129, No=60, Sometimes=19
        # Q3 Main Source: Municipal Tap=79, Borewell=66, Water Tanker=43, Others=20
        # Q6 Drainage Maintenance: Yes=69, No=97, Partially=42
        # Q7 Stagnant Water Near Homes: Yes=116, No=92
        # Q8 Drain Cleaning: Yes=71, No=87, Sometimes=50
        # Q9 Mosquito Problems: Yes=70, No=77, Sometimes=61
        # Q10 Flooding: Yes=92, No=68, Sometimes=48
        # Q11 Garbage Collection: Yes=104, No=67, Sometimes=37
        # Q12 Suggestions: Improve Pipe Network=65, Regular Maintenance & Repair=52, Increase Water Storage=39, Better Drainage & Waste Management=33, Other=19

        q1_list = ["Yes"] * 122 + ["No"] * 65 + ["Sometimes"] * 21
        q2_list = ["Yes"] * 129 + ["No"] * 60 + ["Sometimes"] * 19
        q3_list = ["Municipal Tap"] * 79 + ["Borewell"] * 66 + ["Water Tanker"] * 43 + ["Others"] * 20
        q6_list = ["No"] * 97 + ["Yes"] * 69 + ["Partially"] * 42
        q7_list = ["Yes"] * 116 + ["No"] * 92
        q8_list = ["No"] * 87 + ["Yes"] * 71 + ["Sometimes"] * 50
        q9_list = ["No"] * 77 + ["Yes"] * 70 + ["Sometimes"] * 61
        q10_list = ["Yes"] * 92 + ["No"] * 68 + ["Sometimes"] * 48
        q11_list = ["Yes"] * 104 + ["No"] * 67 + ["Sometimes"] * 37
        q12_list = (
            ["Improve Pipe Network"] * 65 +
            ["Regular Maintenance & Repair"] * 52 +
            ["Increase Water Storage"] * 39 +
            ["Better Drainage & Waste Management"] * 33 +
            ["Other"] * 19
        )

        survey_objects = []
        for i in range(208):
            survey_objects.append(models.SurveyResponse(
                q1_regular_water=q1_list[i],
                q2_summer_shortage=q2_list[i],
                q3_main_source=q3_list[i],
                q6_drainage_maintenance=q6_list[i],
                q7_stagnant_water=q7_list[i],
                q8_drain_cleaning=q8_list[i],
                q9_mosquito_problems=q9_list[i],
                q10_flooding=q10_list[i],
                q11_garbage_collection=q11_list[i],
                q12_suggestion=q12_list[i],
                created_at=get_ist_now() - datetime.timedelta(days=(i % 25) + 1)
            ))
        db.bulk_save_objects(survey_objects)
        db.commit()

    # 3. Seed Demo Complaints if empty
    complaint_count = db.query(models.Complaint).count()
    if complaint_count == 0:
        demo_complaints_data = [
            {
                "id": "CMP-2026-0001",
                "category": "Drainage",
                "problem_type": "Blocked Major Drain",
                "location": "Main Road Junction, near Ramaswami Temple, Ramaswami Peta",
                "description": "The main stormwater drain along the temple road is severely clogged with silt and plastic waste. Greywater is overflowing onto the road causing foul odor and health hazard.",
                "priority": "High",
                "status": "In Progress",
                "assigned_to": "Ward Sanitory Squad 2",
                "latitude": 17.0855,
                "longitude": 81.8942,
                "days_ago": 4
            },
            {
                "id": "CMP-2026-0002",
                "category": "Water Supply",
                "problem_type": "Severe Water Shortage",
                "location": "B.C. Colony, 2nd Lane, Ramaswami Peta",
                "description": "No municipal water supply received for the past 4 consecutive days. Approximately 35 households are struggling for drinking water and relying on private tankers.",
                "priority": "High",
                "status": "Assigned",
                "assigned_to": "Water Works Inspector Chary",
                "latitude": 17.0872,
                "longitude": 81.8965,
                "days_ago": 3
            },
            {
                "id": "CMP-2026-0003",
                "category": "Stagnant Water",
                "problem_type": "Stagnant Water Near Homes",
                "location": "Behind Z.P. High School Ground, Ramaswami Peta",
                "description": "Water has accumulated in open low-lying plot for over two weeks. Heavy mosquito breeding is observed; multiple children in the vicinity reported viral fevers.",
                "priority": "High",
                "status": "Pending",
                "assigned_to": "Unassigned",
                "latitude": 17.0838,
                "longitude": 81.8931,
                "days_ago": 2
            },
            {
                "id": "CMP-2026-0004",
                "category": "Water Supply",
                "problem_type": "Drinking Water Pipeline Leakage",
                "location": "Panchayat Office Corner, Rajanagaram Road",
                "description": "Clean drinking water pipe joint is damaged and leaking substantial water onto the street while reducing pressure to downstream houses.",
                "priority": "Medium",
                "status": "Resolved",
                "assigned_to": "Pipe Line Repair Team A",
                "latitude": 17.0862,
                "longitude": 81.8978,
                "days_ago": 6
            },
            {
                "id": "CMP-2026-0005",
                "category": "Garbage",
                "problem_type": "Garbage Accumulation in Drain",
                "location": "Market Street, near Milk Booth, Ramaswami Peta",
                "description": "Vegetable waste and plastic carry bags dumped into open side drains preventing flow and causing black water accumulation.",
                "priority": "Medium",
                "status": "Pending",
                "assigned_to": "Unassigned",
                "latitude": 17.0845,
                "longitude": 81.8955,
                "days_ago": 1
            },
            {
                "id": "CMP-2026-0006",
                "category": "Drainage",
                "problem_type": "Low-lying Street Flooding",
                "location": "Post Office Lane, Ward 4, Ramaswami Peta",
                "description": "After yesterday's rain, the entire lane is waterlogged due to absence of culvert outlet connecting to the main canal.",
                "priority": "High",
                "status": "In Progress",
                "assigned_to": "Civil Works Division",
                "latitude": 17.0880,
                "longitude": 81.8920,
                "days_ago": 5
            }
        ]

        for item in demo_complaints_data:
            c_date = get_ist_now() - datetime.timedelta(days=item["days_ago"])
            comp = models.Complaint(
                id=item["id"],
                user_id=resident_user.id,
                category=item["category"],
                problem_type=item["problem_type"],
                location=item["location"],
                description=item["description"],
                photo_data=None,
                priority=item["priority"],
                status=item["status"],
                assigned_to=item["assigned_to"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                created_at=c_date,
                updated_at=c_date
            )
            db.add(comp)
            
            # Initial log
            update_log = models.ComplaintUpdate(
                complaint_id=item["id"],
                previous_status="None",
                new_status="Pending",
                updated_by="Resident Portal",
                comment="Initial complaint submission.",
                timestamp=c_date
            )
            db.add(update_log)
            
            # Additional update logs based on status
            if item["status"] in ["Assigned", "In Progress", "Resolved"]:
                log_assigned = models.ComplaintUpdate(
                    complaint_id=item["id"],
                    previous_status="Pending",
                    new_status="Assigned",
                    updated_by="Admin Officer",
                    comment=f"Assigned to {item['assigned_to']} for site inspection.",
                    timestamp=c_date + datetime.timedelta(hours=6)
                )
                db.add(log_assigned)
                
            if item["status"] in ["In Progress", "Resolved"]:
                log_progress = models.ComplaintUpdate(
                    complaint_id=item["id"],
                    previous_status="Assigned",
                    new_status="In Progress",
                    updated_by=item["assigned_to"],
                    comment="Field crew deployed on-site with desilting equipment.",
                    timestamp=c_date + datetime.timedelta(hours=18)
                )
                db.add(log_progress)
                
            if item["status"] == "Resolved":
                log_resolved = models.ComplaintUpdate(
                    complaint_id=item["id"],
                    previous_status="In Progress",
                    new_status="Resolved",
                    updated_by="Admin Officer",
                    comment="Pipeline repaired and pressure tested. Normal water flow restored.",
                    timestamp=c_date + datetime.timedelta(hours=36)
                )
                db.add(log_resolved)

        db.commit()

    # 4. Seed Awareness Content if empty
    awareness_count = db.query(models.AwarenessContent).count()
    if awareness_count == 0:
        awareness_items = [
            {
                "category": "Water Conservation",
                "title": "Domestic Water Conservation & Leak Prevention",
                "description": "In Ramaswami Peta, summer water shortages affect 62% of households. Adopting mindful domestic habits preserves groundwater and minimizes reliance on emergency water tankers.",
                "tips_json": json.dumps([
                    "Inspect overhead tank float valves regularly to prevent overflow wastage.",
                    "Fix dripping taps immediately — a single dripping tap wastes over 15 liters of water daily.",
                    "Adopt aerator nozzles on household taps to reduce flow rate by 40% without losing rinsing pressure.",
                    "Reuse RO filter wastewater (reject water) for mopping, gardening, and washing courtyards."
                ]),
                "icon_name": "water-drop"
            },
            {
                "category": "Rainwater Harvesting",
                "title": "Rooftop Rainwater Harvesting & Recharge Pits",
                "description": "With Rajanagaram receiving seasonal monsoon rainfall, harvesting rainwater into recharge pits recharges borewells and combats the acute summer water depletion.",
                "tips_json": json.dumps([
                    "Construct simple 1m x 1m gravel-and-sand recharge pits around domestic borewells.",
                    "Route rooftop rainwater via PVC downpipes with basic mesh filter to prevent leaf debris.",
                    "Store first-flush rainwater in dedicated underground sumps for non-potable domestic use.",
                    "Community recharge trenches along road edges can raise water tables by 2-3 meters annually."
                ]),
                "icon_name": "cloud-rain"
            },
            {
                "category": "Drainage Hygiene",
                "title": "Preventing Drain Blockages & Sewage Backflow",
                "description": "Over 46% of surveyed residents report unmaintained drains leading to foul odor and overflow. Keeping community drains free of solid waste is essential for public health.",
                "tips_json": json.dumps([
                    "Never dump plastic bottles, thermocol, or polythene bags into open roadside drains.",
                    "Do not dispose of cooking oil or greasy liquids into drains; grease solidifies and traps silt.",
                    "Install domestic gratings or wire mesh at home discharge outlets to catch solid debris.",
                    "Notify the Panchayat immediately when silt accumulation reaches more than half drain depth."
                ]),
                "icon_name": "git-pull-request"
            },
            {
                "category": "Vector & Mosquito Control",
                "title": "Eliminating Stagnant Water & Preventing Dengue/Malaria",
                "description": "55.8% of surveyed households noticed stagnant water near homes, creating rampant mosquito breeding. Proactive elimination of water pools prevents vector-borne epidemics.",
                "tips_json": json.dumps([
                    "Empty and scrub water storage drums, coolers, and flower pot trays every Friday (Dry Day).",
                    "Keep all drinking water containers tightly covered with lids.",
                    "Fill low-lying puddles in vacant plots with sand or soil to eliminate standing pools.",
                    "Apply a few drops of biodegradable oil or neem oil on stagnant puddles to prevent larvae survival."
                ]),
                "icon_name": "shield-alert"
            }
        ]
        for aw in awareness_items:
            db.add(models.AwarenessContent(
                category=aw["category"],
                title=aw["title"],
                description=aw["description"],
                tips_json=aw["tips_json"],
                icon_name=aw["icon_name"],
                created_at=get_ist_now()
            ))
        db.commit()

    # 5. Seed Welcome Notifications for resident
    notif_count = db.query(models.Notification).filter(models.Notification.user_id == resident_user.id).count()
    if notif_count == 0:
        db.add(models.Notification(
            user_id=resident_user.id,
            complaint_id="CMP-2026-0004",
            title="Complaint Resolved",
            message="Your complaint CMP-2026-0004 regarding Drinking Water Pipeline Leakage has been marked Resolved.",
            is_read=False,
            created_at=get_ist_now() - datetime.timedelta(days=4)
        ))
        db.add(models.Notification(
            user_id=resident_user.id,
            complaint_id="CMP-2026-0001",
            title="Complaint In Progress",
            message="Complaint CMP-2026-0001 regarding Blocked Major Drain is currently In Progress.",
            is_read=True,
            created_at=get_ist_now() - datetime.timedelta(days=2)
        ))
        db.commit()
