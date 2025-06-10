import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
  contentLink: string | null = null;
  sanitizedContentLink: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const courseId = this.route.snapshot.params['courseId'];
    if (courseId) {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        alert('You are not authenticated. Please log in.');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      this.http.get(`http://localhost:9091/course/getContentBy/${courseId}`, { headers, responseType: 'text' }).subscribe({
        next: (link: string) => {
          this.contentLink = link;
          const embedUrl = this.getEmbeddableUrl(link);
          this.sanitizedContentLink = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        },
        error: (error) => {
          console.error('Error fetching content link:', error);
          alert('Failed to load course content. Please try again later.');
        }
      });
    } else {
      alert('Invalid course ID.');
    }
  }

  getEmbeddableUrl(link: string): string {
    if (link.includes('youtu.be/')) {
      return link.replace('youtu.be/', 'www.youtube.com/embed/');
    } else if (link.includes('watch?v=')) {
      return link.replace('watch?v=', 'embed/');
    }
    return link;
  }

  isEmbeddable(link: string): boolean {
    return link.includes('youtube.com') || link.includes('youtu.be');
  }
}
