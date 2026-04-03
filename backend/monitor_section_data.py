#!/usr/bin/env python3
"""
Section Data Monitor - Real-time monitoring and debugging tool
"""

import json
import time
import os
from datetime import datetime
from typing import Dict, List, Any

class SectionDataMonitor:
    def __init__(self, file_path: str = "SectionData.json"):
        self.file_path = file_path
        self.last_modified = 0
        self.sections_cache = {}
        
    def load_data(self) -> Dict[str, Any]:
        """Load and parse SectionData.json"""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error loading {self.file_path}: {e}")
            return {"sections": []}
    
    def get_file_stats(self) -> Dict[str, Any]:
        """Get file statistics"""
        try:
            stat = os.stat(self.file_path)
            return {
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "exists": True
            }
        except:
            return {"size": 0, "modified": None, "exists": False}
    
    def analyze_sections(self) -> Dict[str, Any]:
        """Analyze all sections for issues"""
        data = self.load_data()
        sections = data.get("sections", [])
        
        analysis = {
            "total_sections": len(sections),
            "sections_by_role": {},
            "sections_by_level": {},
            "question_distribution": {},
            "issues": [],
            "duplicates": []
        }
        
        # Track all question IDs for duplicate detection
        all_questions = {}
        
        for section in sections:
            role = section.get("role", "Unknown")
            level = section.get("level", "Unknown")
            section_code = section.get("sectionCode", "Unknown")
            transcripts = section.get("questionTranscripts", [])
            
            # Count by role and level
            analysis["sections_by_role"][role] = analysis["sections_by_role"].get(role, 0) + 1
            analysis["sections_by_level"][level] = analysis["sections_by_level"].get(level, 0) + 1
            
            # Question distribution
            question_count = len(transcripts)
            analysis["question_distribution"][question_count] = analysis["question_distribution"].get(question_count, 0) + 1
            
            # Check for issues
            if question_count == 0:
                analysis["issues"].append(f"Section {section_code} has no transcripts")
            
            # Check for duplicates within section
            question_ids = [t.get("questionId") for t in transcripts]
            if len(question_ids) != len(set(question_ids)):
                analysis["issues"].append(f"Section {section_code} has duplicate questions")
            
            # Track all questions for cross-section duplicate detection
            for transcript in transcripts:
                q_id = transcript.get("questionId")
                key = f"{section_code}_{q_id}"
                if key in all_questions:
                    analysis["duplicates"].append({
                        "question_id": q_id,
                        "sections": [all_questions[key]["section_code"], section_code],
                        "timestamps": [all_questions[key]["timestamp"], transcript.get("timestamp")]
                    })
                else:
                    all_questions[key] = {
                        "section_code": section_code,
                        "timestamp": transcript.get("timestamp")
                    }
        
        return analysis
    
    def monitor_changes(self, interval: int = 5):
        """Monitor file changes in real-time"""
        print(f"🔍 Monitoring {self.file_path} for changes...")
        print("Press Ctrl+C to stop monitoring")
        
        try:
            while True:
                current_stats = self.get_file_stats()
                
                if current_stats["modified"] != self.last_modified:
                    self.last_modified = current_stats["modified"]
                    print(f"\n📝 File changed at {current_stats['modified']}")
                    
                    # Analyze the current state
                    analysis = self.analyze_sections()
                    self.display_analysis(analysis)
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n👋 Monitoring stopped")
    
    def display_analysis(self, analysis: Dict[str, Any]):
        """Display analysis results"""
        print(f"\n📊 Section Analysis ({datetime.now().isoformat()})")
        print("=" * 50)
        print(f"Total Sections: {analysis['total_sections']}")
        
        print(f"\n📈 Sections by Role:")
        for role, count in analysis["sections_by_role"].items():
            print(f"  {role}: {count}")
        
        print(f"\n📈 Sections by Level:")
        for level, count in analysis["sections_by_level"].items():
            print(f"  {level}: {count}")
        
        print(f"\n📈 Question Distribution:")
        for count, sections in sorted(analysis["question_distribution"].items()):
            print(f"  {count} questions: {sections} sections")
        
        if analysis["issues"]:
            print(f"\n⚠️ Issues Found ({len(analysis['issues'])}):")
            for issue in analysis["issues"]:
                print(f"  • {issue}")
        
        if analysis["duplicates"]:
            print(f"\n🔄 Cross-Section Duplicates ({len(analysis['duplicates'])}):")
            for dup in analysis["duplicates"]:
                print(f"  • Question {dup['question_id']} in sections {dup['sections']}")
    
    def search_section(self, section_code: str) -> Dict[str, Any]:
        """Search for a specific section"""
        data = self.load_data()
        sections = data.get("sections", [])
        
        for section in sections:
            if section.get("sectionCode") == section_code:
                return section
        
        return {}
    
    def cleanup_duplicates(self, dry_run: bool = True):
        """Clean up duplicate transcripts"""
        if dry_run:
            print("🔍 DRY RUN - No changes will be made")
        
        data = self.load_data()
        sections = data.get("sections", [])
        changes_made = 0
        
        for i, section in enumerate(sections):
            transcripts = section.get("questionTranscripts", [])
            if not transcripts:
                continue
            
            # Find duplicates within section
            seen_questions = set()
            clean_transcripts = []
            
            for transcript in transcripts:
                q_id = transcript.get("questionId")
                if q_id not in seen_questions:
                    clean_transcripts.append(transcript)
                    seen_questions.add(q_id)
                else:
                    changes_made += 1
                    print(f"{'🗑️' if not dry_run else '🔍'} Removing duplicate {q_id} from section {section.get('sectionCode')}")
            
            if len(clean_transcripts) != len(transcripts):
                if not dry_run:
                    sections[i]["questionTranscripts"] = clean_transcripts
                    sections[i]["questionsAnswered"] = len(clean_transcripts)
        
        if changes_made > 0 and not dry_run:
            # Save the cleaned data
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump({"sections": sections}, f, indent=2, ensure_ascii=False)
            print(f"💾 Cleaned up {changes_made} duplicates")
        elif changes_made > 0:
            print(f"🔍 Found {changes_made} duplicates to clean")
        else:
            print("✅ No duplicates found")

def main():
    """Main function for CLI usage"""
    import sys
    
    monitor = SectionDataMonitor()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "monitor":
            interval = int(sys.argv[2]) if len(sys.argv) > 2 else 5
            monitor.monitor_changes(interval)
        
        elif command == "analyze":
            analysis = monitor.analyze_sections()
            monitor.display_analysis(analysis)
        
        elif command == "search":
            if len(sys.argv) > 2:
                section_code = sys.argv[2]
                section = monitor.search_section(section_code)
                if section:
                    print(f"✅ Found section {section_code}:")
                    print(json.dumps(section, indent=2))
                else:
                    print(f"❌ Section {section_code} not found")
            else:
                print("Usage: python monitor.py search <section_code>")
        
        elif command == "cleanup":
            dry_run = "--dry-run" in sys.argv
            monitor.cleanup_duplicates(dry_run=dry_run)
        
        else:
            print("Usage: python monitor.py [monitor|analyze|search|cleanup] [options]")
    else:
        # Default: show analysis
        analysis = monitor.analyze_sections()
        monitor.display_analysis(analysis)

if __name__ == "__main__":
    main()
