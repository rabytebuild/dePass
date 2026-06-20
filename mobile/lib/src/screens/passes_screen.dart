import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/session_provider.dart';

class PassesScreen extends StatelessWidget {
  const PassesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SessionProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Passes'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Pass management', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            const Text('View generated passes and sync state from the Laravel backend.', style: TextStyle(color: Color(0xFF4B4A45))),
            const SizedBox(height: 20),
            Expanded(
              child: session.passes.isEmpty
                  ? const Center(
                      child: Text('No passes loaded yet. Visit an event and fetch packages to sync passes.'),
                    )
                  : ListView.builder(
                      itemCount: session.passes.length,
                      itemBuilder: (context, index) {
                        final pass = session.passes[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: ListTile(
                            title: Text(pass['attendee_name'] as String? ?? 'Unnamed attendee'),
                            subtitle: Text(pass['company'] as String? ?? 'No company'),
                            trailing: Text(pass['status'] as String? ?? 'unknown'),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
