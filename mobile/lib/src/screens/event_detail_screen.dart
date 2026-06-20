import 'package:flutter/material.dart';

class EventDetailScreen extends StatelessWidget {
  const EventDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Event Details'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Event details will appear here.', style: TextStyle(fontSize: 16, color: Color(0xFF1B1B18))),
            SizedBox(height: 16),
            Text(
              'This screen will connect to the Laravel backend to load selected event packages, pass types, and approved devices.',
              style: TextStyle(color: Color(0xFF4B4A45)),
            ),
          ],
        ),
      ),
    );
  }
}
